/* Gmail 2.3.5.1 of the Nexus S image (GRK39F), summer 2011, from Gmail.apk's layouts, drawables, styles and code:
   - ConversationListActivity: custom_title.xml (the label with its unread count on the left, the account on the right,
     #f6f6f6 text with a black 1 px shadow on title_bar), CanvasConversationHeaderView rows (60 dip; the check box at
     3 / 8 dip; the subject in 18 sp, bold while unread, followed by the #777777 snippet; below it the personal-level
     caret, the senders in 14 sp, the labels in their colours and the date; the star at the right, 5 dip from the top;
     unread rows white, read rows background_read_conversation #e7e3e7), the footer_organize bar (Archive, Delete,
     Labels) while conversations are checked, and the #A4C639 undo bar.
   - HtmlConversationActivity: res/raw-hdpi/styles.css (a WebView: the bold subject with label chips, message cards on
     message_header.9, the contact picture in contact_offline, the sender in 24 px bold, the action strip with Reply /
     Reply all / Forward, the body) over the bottom bar with Archive, Delete, Newer and Older.
   - ComposeActivity: compose_custom_title.xml (54 dip; "Compose", or the Reply / Reply all / Forward picker, then Send and
     Save draft) over compose_area_layout.xml on #ededed (From, To, Cc / Bcc, Subject, "Compose Mail"), with
     quoted_text.xml (#d5d5d5: "Include text" and "Respond inline").
   - LabelsActivity ("Go to labels"): label_item.xml rows with the unread count.
   - The Menu-key menus: conversation_list_menu, conversation_list_menu_organize_mode, conversation_menu, compose_menu.
   Texts are Gmail.apk's (docs/tools/apk-strings.py); the account and the mail are offline and made up. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const {e} = GBApps;
  const STRINGS = {
    "Inbox": {"res": "Gmail:label_inbox", "hu": "Beérkezett üzenetek", "de": "Posteingang", "fr": "Boîte de réception", "es": "Recibidos"},
    "Priority Inbox": {"res": "Gmail:label_magic_inbox", "hu": "Prioritások", "de": "Sortierter Eingang", "fr": "Prioritaire", "es": "Prioritarios"},
    "Starred": {"res": "Gmail:label_starred", "hu": "Csillaggal megjelölt", "de": "Markiert", "fr": "Messages suivis", "es": "Destacados"},
    "Chats": {"res": "Gmail:label_chat", "hu": "Csevegések", "de": "Chats", "fr": "Tous les chats", "es": "Chats"},
    "Sent": {"res": "Gmail:label_sent", "hu": "Elküldve", "de": "Gesendet", "fr": "Messages envoyés", "es": "Enviados"},
    "Outbox": {"res": "Gmail:label_outbox", "hu": "Kimenő levelek", "de": "Postausgang", "fr": "Boîte d'envoi", "es": "Bandeja de salida"},
    "Drafts": {"res": "Gmail:label_draft", "hu": "Piszkozatok", "de": "Entwürfe", "fr": "Brouillons", "es": "Borradores"},
    "All Mail": {"res": "Gmail:label_all", "hu": "Összes levél", "de": "Alle Nachrichten", "fr": "Tous les messages", "es": "Todos"},
    "Spam": {"res": "Gmail:label_spam", "hu": "Spam", "de": "Spam", "fr": "Spam", "es": "Spam"},
    "Trash": {"res": "Gmail:label_trash", "hu": "Kuka", "de": "Papierkorb", "fr": "Corbeille", "es": "Papelera"},
    "Important": {"res": "Gmail:label_important", "hu": "Fontos", "de": "Wichtig", "fr": "Important", "es": "Importante"},
    "Muted": {"res": "Gmail:label_ignored", "hu": "Lezárva", "de": "Unterdrückt", "fr": "Ignorée", "es": "Silenciado"},
    "Refresh": {"res": "Gmail:refresh", "hu": "Frissítés", "de": "Aktualisieren", "fr": "Actualiser", "es": "Actualizar"},
    "Compose": {"res": "Gmail:menu_compose", "hu": "Levélírás", "de": "E-Mail schreiben", "fr": "Nouveau message", "es": "Redactar"},
    "Accounts": {"res": "Gmail:accounts", "hu": "Fiókok", "de": "Konten", "fr": "Comptes", "es": "Cuentas"},
    "Go to labels": {"res": "Gmail:menu_labels", "hu": "Ugrás a címkékhez", "de": "Zu den Labels", "fr": "Ouvrir les libellés", "es": "Ir a etiquetas"},
    "Search": {"res": "Gmail:menu_search", "hu": "Keresés", "de": "Suchen", "fr": "Rechercher", "es": "Buscar"},
    "Go to inbox": {"res": "Gmail:back_to_inbox", "hu": "Beérk. lev.", "de": "Posteingang", "fr": "Boîte réception", "es": "Ir a Recibidos"},
    "Settings": {"res": "Gmail:menu_preferences", "hu": "Beállítások", "de": "Einstellungen", "fr": "Paramètres", "es": "Ajustes"},
    "Help": {"res": "Gmail:help_and_info", "hu": "Súgó", "de": "Hilfe", "fr": "Aide", "es": "Ayuda"},
    "About": {"res": "Gmail:about_menu_item", "hu": "Ismertető", "de": "Über", "fr": "À propos", "es": "Acerca de"},
    "Star": {"res": "Gmail:star", "hu": "Csillag", "de": "Markierung", "fr": "Suivi", "es": "Destacar"},
    "Read/unread": {"res": "Gmail:read_unread", "hu": "Olvasott/olvasatlan", "de": "Gelesen/ungelesen", "fr": "Lu/non lu", "es": "Leídas / No leídas"},
    "Mark important": {"res": "Gmail:mark_important", "hu": "Megjelölés fontosként", "de": "Als wichtig markieren", "fr": "Marquer comme important", "es": "Marcar como importante"},
    "Not important": {"res": "Gmail:mark_not_important", "hu": "Nem fontos", "de": "Unwichtig", "fr": "Non important", "es": "Marcar como no importante"},
    "Report spam": {"res": "Gmail:report_spam", "hu": "Ez spam", "de": "Spam melden", "fr": "Signaler comme spam", "es": "Marcar como spam"},
    "Mute": {"res": "Gmail:mute", "hu": "Lezárás", "de": "Ignorieren", "fr": "Ignorer", "es": "Silenciar"},
    "Deselect all": {"res": "Gmail:deselect_all", "hu": "Az összes kijelölés törlése", "de": "Auswahl aufheben", "fr": "Tout désélectionner", "es": "Desmarcar todas"},
    "Not spam": {"res": "Gmail:not_spam", "hu": "Nem spam", "de": "Kein Spam", "fr": "Non-spam", "es": "No es spam"},
    "Archive": {"res": "Gmail:archive", "hu": "Archiválás", "de": "Archiv.", "fr": "Archiver", "es": "Archivar"},
    "Delete": {"res": "Gmail:delete", "hu": "Törlés", "de": "Löschen", "fr": "Suppr.", "es": "Suprimir"},
    "Labels": {"res": "Gmail:apply_labels", "hu": "Címkék", "de": "Labels", "fr": "Libellés", "es": "Etiquetas"},
    "Change labels": {"res": "Gmail:menu_change_labels", "hu": "Címkék módosítása", "de": "Labels ändern", "fr": "Changer de libellés", "es": "Cambiar etiquetas"},
    "Mark unread": {"res": "Gmail:mark_unread", "hu": "Megjelölés olvasatlanként", "de": "Als ungelesen markieren", "fr": "Marquer comme non lu", "es": "Marcar como no leído"},
    "Add star": {"res": "Gmail:add_star", "hu": "Csillagozás", "de": "Markieren", "fr": "Activer le suivi", "es": "Añadir estrella"},
    "Remove star": {"res": "Gmail:remove_star", "hu": "Csillag eltávolítása", "de": "Markierung entfernen", "fr": "Désactiver le suivi", "es": "Quitar estrella"},
    "Select text": {"res": "Gmail:select_text", "hu": "Szöveg kijelölése", "de": "Text auswählen", "fr": "Sélectionner le texte", "es": "Seleccionar texto"},
    "Newer": {"res": "Gmail:previous", "hu": "Újabb", "de": "Neuere", "fr": "Suiv.", "es": "Más reciente"},
    "Older": {"res": "Gmail:next", "hu": "Régebbiek", "de": "Ältere", "fr": "Préc.", "es": "Anterior"},
    "Undo": {"res": "Gmail:undo", "hu": "Visszavonás", "de": "Rückgängig", "fr": "Annuler", "es": "Deshacer"},
    "No conversations.": {"res": "Gmail:no_conversations", "hu": "Nincsenek beszélgetések.", "de": "Keine Konversationen", "fr": "Aucune conversation.", "es": "No hay conversaciones."},
    "Reply": {"res": "Gmail:reply", "hu": "Válasz", "de": "Antworten", "fr": "Répondre", "es": "Responder"},
    "Reply all": {"res": "Gmail:reply_all", "hu": "Mindenkinek", "de": "Allen antw.", "fr": "Rép. à tous", "es": "Responder a todos"},
    "Forward": {"res": "Gmail:forward", "hu": "Továbbítás", "de": "Weiterleiten", "fr": "Transférer", "es": "Reenviar"},
    "Send": {"res": "Gmail:send", "hu": "Küldés", "de": "Senden", "fr": "Envoyer", "es": "Enviar"},
    "Save draft": {"res": "Gmail:save", "hu": "Piszkozat mentése", "de": "Speichern", "fr": "Enr. brouillon", "es": "Guardar borrador"},
    "Discard": {"res": "Gmail:discard", "hu": "Elvetés", "de": "Verwerfen", "fr": "Supprimer", "es": "Descartar"},
    "Add Cc/Bcc": {"res": "Gmail:add_cc_label", "hu": "Másolatot kap és Titkos másolat mezők hozzáadása", "de": "\"Cc\"/\"Bcc\" hinzufügen", "fr": "Ajouter Cc/Cci", "es": "Añadir Cc/CCO"},
    "Remove Cc/Bcc": {"res": "Gmail:remove_cc_label", "hu": "Másolatot kap és Titkos másolat mezők eltávolítása", "de": "\"Cc\"/\"Bcc\" entfernen", "fr": "Supprimer Cc/Cci", "es": "Eliminar Cc/CCO"},
    "Attach": {"res": "Gmail:add_attachment", "hu": "Csatolás", "de": "Anhang", "fr": "Pièce jointe", "es": "Adjuntar"},
    "To": {"res": "Gmail:to", "hu": "Címzett", "de": "An", "fr": "À", "es": "Para"},
    "Cc": {"res": "Gmail:compose_activity_cc_label_text", "hu": "Másolatot kap", "de": "Cc", "fr": "Cc", "es": "Cc"},
    "Bcc": {"res": "Gmail:compose_activity_bcc_label_text", "hu": "Titkos másolat", "de": "Bcc", "fr": "Cci", "es": "CCO"},
    "Subject": {"res": "Gmail:subject_hint", "hu": "Tárgy", "de": "Betreff", "fr": "Objet", "es": "Asunto"},
    "Compose Mail": {"res": "Gmail:body_hint", "hu": "Levélírás", "de": "E-Mail schreiben", "fr": "Nouveau message", "es": "Redactar"},
    "From": {"res": "Gmail:from_account_prefix", "hu": "Feladó", "de": "Von", "fr": "De", "es": "De"},
    "Include text": {"res": "Gmail:quoted_text_checkbox_label", "hu": "Szöveggel együtt", "de": "Text einfügen", "fr": "Inclure le texte", "es": "Incluir texto"},
    "Respond inline": {"res": "Gmail:respond_inline", "hu": "Válasz belülről", "de": "Inline antworten", "fr": "Répondre dans l'e-mail", "es": "Responder entre líneas"},
    "Message saved as draft.": {"res": "Gmail:message_saved", "hu": "Az üzenet mentve piszkozatként.", "de": "Nachricht als Entwurf gespeichert", "fr": "Message enregistré comme brouillon.", "es": "Mensaje guardado como borrador"},
    "Message discarded.": {"res": "Gmail:message_discarded", "hu": "Üzenet elvetve.", "de": "Nachricht gelöscht", "fr": "Message supprimé.", "es": "Mensaje descartado"},
    "Sending message…": {"res": "Gmail:sending_message", "hu": "Üzenet küldése…", "de": "Nachricht wird gesendet…", "fr": "Envoi du message…", "es": "Enviando mensaje…"},
    "Please add at least one recipient.": {"res": "Gmail:recipient_needed", "hu": "Kérjük, vegyen fel legalább egy címzettet.", "de": "Fügen Sie mindestens einen Empfänger hinzu.", "fr": "Vous devez indiquer au moins un destinataire.", "es": "Añade al menos un destinatario."},
    "Your message has not been sent.\nDiscard your message?": {"res": "Gmail:message_not_sent", "hu": "A levele nem lett elküldve.\nElveti a levelet?", "de": "Ihre Nachricht wurde nicht gesendet.\n Nachricht verwerfen?", "fr": "Votre message n'a pas été envoyé.\nSupprimer le message ?", "es": "El mensaje no se ha enviado.\n¿Deseas descartarlo?"},
    "The address %s is invalid.": {"res": "Gmail:wrong_recipient", "hu": "A(z) %s cím érvénytelen.", "de": "Die Adresse %s ist ungültig", "fr": "L'adresse \"%s\" est incorrecte.", "es": "La dirección %s no es válida."},
    "Me": {"res": "Gmail:me", "hu": "én", "de": "Ich", "fr": "Moi", "es": "Yo"},
    "To:": {"res": "Gmail:to_heading", "hu": "Címzett:", "de": "An:", "fr": "À :", "es": "Para:"},
    "Cc:": {"res": "Gmail:cc_heading", "hu": "Másolat:", "de": "Cc:", "fr": "Cc :", "es": "Cc:"},
    "Show details": {"res": "Gmail:show_recipient_details", "hu": "Részletek megjelenítése", "de": "Details anzeigen", "fr": "Afficher les détails", "es": "Mostrar detalles"},
    "Hide details": {"res": "Gmail:hide_recipient_details", "hu": "Részletek elrejtése", "de": "Details ausblenden", "fr": "Masquer les détails", "es": "Ocultar detalles"},
    "Re:": {"res": "Gmail:reply_subject_label", "hu": "Re:", "de": "Re:", "fr": "Re:", "es": "Re:"},
    "Fwd:": {"res": "Gmail:forward_subject_label", "hu": "Fwd:", "de": "Fwd:", "fr": "Fwd:", "es": "Fwd:"},
    "On %s, %s wrote:": {"res": "Gmail:reply_attribution", "hu": "%s, %s ezt írta:", "de": "Am %s schrieb %s:", "fr": "Le %s, %s a écrit :", "es": "El %s, %s escribió:"},
    "No labels have been set for this account.": {"res": "Gmail:labels_activity_instructions", "hu": "Nincs beállítva címke ehhez a fiókhoz.", "de": "Für dieses Konto wurden noch keine Labels festgelegt.", "fr": "Aucun libellé n'a été défini pour ce compte.", "es": "No se ha establecido ninguna etiqueta para esta cuenta."},
    "Version %s": {"res": "Gmail:version", "hu": "Verzió: %s", "de": "Version %s", "fr": "Version %s", "es": "Versión %s"},
    "©%d Google Inc.": {"res": "Gmail:copyright", "hu": "©%d Google Inc.", "de": "© %d Google Inc.", "fr": "©%d Google Inc.", "es": "©%d Google Inc."},
    "Archiving %1$d conversation.": {"res": "Gmail:@plurals/conversation_archiving:one", "hu": "%1$d beszélgetés archiválása.", "de": "%1$d Konversation werden archiviert.", "fr": "Archivage de %1$d conversation.", "es": "Archivando %1$d conversación"},
    "Archiving %1$d conversations.": {"res": "Gmail:@plurals/conversation_archiving:other", "hu": "%1$d beszélgetés archiválása.", "de": "%1$d Konversationen werden archiviert.", "fr": "Archivage de %1$d conversations.", "es": "Archivando %1$d conversaciones"},
    "Deleting %1$d conversation.": {"res": "Gmail:@plurals/conversation_deleting:one", "hu": " %1$d beszélgetés törlése.", "de": "%1$d Konversation wird gelöscht.", "fr": "Suppression de %1$d conversation.", "es": "Eliminando %1$d conversación"},
    "Deleting %1$d conversations.": {"res": "Gmail:@plurals/conversation_deleting:other", "hu": "%1$d beszélgetés törlése.", "de": "%1$d Konversationen werden gelöscht.", "fr": "Suppression de %1$d conversations.", "es": "Eliminando %1$d conversaciones"},
    "Muting %1$d conversation.": {"res": "Gmail:@plurals/conversation_muting:one", "hu": "%1$d beszélgetés lezárása.", "de": "%1$d Konversation wird stummgeschaltet.", "fr": "Suspension de %1$d conversation", "es": "Silenciando %1$d conversación..."},
    "Muting %1$d conversations.": {"res": "Gmail:@plurals/conversation_muting:other", "hu": "%1$d beszélgetés lezárása.", "de": "%1$d Konversationen werden stummgeschaltet.", "fr": "Suspension de %1$d conversations", "es": "Silenciando %1$d conversaciones..."},
    "Reporting %1$d conversation as spam.": {"res": "Gmail:@plurals/conversation_spamming:one", "hu": "%1$d beszélgetés bejelentése spamként.", "de": "%1$d Konversation wird als Spam gemeldet.", "fr": "Signalement de %1$d conversation comme spam", "es": "Enviando notificación de spam de %1$d conversación..."},
    "Reporting %1$d conversations as spam.": {"res": "Gmail:@plurals/conversation_spamming:other", "hu": "%1$d beszélgetés bejelentése spamként.", "de": "%1$d Konversationen werden als Spam gemeldet.", "fr": "Signalement de %1$d conversations comme spam", "es": "Enviando notificación de spam de %1$d conversaciones..."}
  };
  const T = GBApps.texts(STRINGS);
  const ACCOUNT = 'gingerbread.demo@gmail.com', VERSION = '2.3.5.1';
  const SYSTEM = ['Priority Inbox', 'Inbox', 'Starred', 'Chats', 'Sent', 'Outbox', 'Drafts', 'All Mail', 'Spam', 'Trash'];
  // The account's own labels in Gmail's label palette (text colour, background).
  const USER_LABELS = {Friends: ['#206cff', '#e0ecff'], Travel: ['#64992c', '#f9ffef'], Work: ['#b36d00', '#fadcb3']};
  const ASSET = name => `assets/gm-${name}.png`;
  const H = 36e5, D = 864e5;
  // A summer 2011 mailbox: [subject, labels, important, starred, read, messages [from, address, body, hours ago]].
  const SAMPLES = [
    ['Welcome to your Nexus S', ['Inbox'], true, false, false, [['Google Nexus', 'nexus-noreply@google.com', 'Your Nexus S runs Android 2.3, Gingerbread. Tap your phone to NFC tags, make free Internet calls, and find thousands of apps on Android Market.', 1]]],
    ['Hike on Saturday?', ['Inbox', 'Friends'], true, true, false, [['Alex Morgan', 'alex@example.com', 'Are you up for the ridge trail this weekend? I can pick you up at 8.', 20], ['me', ACCOUNT, 'Sounds great! I will bring sandwiches.', 18], ['Alex Morgan', 'alex@example.com', 'Perfect. Don’t forget your phone, the new maps are great on the trail.', 3]]],
    ['Gmail is different. Here’s what you need to know.', ['Inbox'], false, false, true, [['Gmail Team', 'mail-noreply@google.com', 'Messages are grouped into conversations, labels work like folders that can overlap, and the star marks what matters to you. Priority Inbox puts your important mail first.', 30]]],
    ['Sunday lunch', ['Inbox'], false, false, true, [['Mom', 'mom@example.com', 'Don’t forget Sunday lunch at ours. Bring dessert if you can!', 52]]],
    ['Slides for Monday', ['Inbox', 'Work'], true, false, true, [['Taylor Lee', 'taylor@example.com', 'Here are the slides from the meetup. Let me know what you think before Monday.', 76]]],
    ['Flight itinerary: Budapest', ['Travel'], false, false, true, [['Sam Rivera', 'sam@example.com', 'Here is the itinerary for August. We land at 14:20, the hotel is near the river.', 120]]],
    ['Your Android Market order', ['Inbox'], false, false, true, [['Android Market', 'android-market@google.com', 'Thanks for trying apps from Android Market. Your purchase is ready to install on your Nexus S.', 170]]]
  ];
  function restore(saved, now = Date.now()) {
    if (Array.isArray(saved)) return saved;
    return SAMPLES.map(([subject, labels, important, starred, read, messages], i) => ({id: 'gm-' + (i + 1), subject, labels, important, starred, read,
      messages: messages.map(([from, address, body, hours], j) => ({id: `gm-${i + 1}-${j}`, from, address, to: address === ACCOUNT ? messages[0][1] : ACCOUNT, body, created: now - hours * H}))}));
  }
  const has = (c, label) => c.labels.includes(label);
  const live = c => !has(c, 'Trash') && !has(c, 'Spam');
  function inLabel(c, label) {
    if (label === 'Priority Inbox') return has(c, 'Inbox') && c.important;
    if (label === 'Starred') return c.starred && live(c);
    if (label === 'Important') return c.important && live(c);
    if (label === 'All Mail') return live(c) && !(c.messages.length === 1 && c.draft);
    return has(c, label);
  }
  const last = c => c.messages[c.messages.length - 1];
  const sorted = list => [...list].sort((a, b) => last(b).created - last(a).created);
  function list(mail, label, query) {
    const q = String(query || '').toLocaleLowerCase();
    return sorted(mail.filter(c => q ? live(c) && [c.subject, ...c.messages.flatMap(m => [m.from, m.body])].join(' ').toLocaleLowerCase().includes(q) : inLabel(c, label)));
  }
  const unread = (mail, label) => list(mail, label).filter(c => !c.read).length;
  const labelName = (lang, label) => USER_LABELS[label] ? label : T(lang, label);
  // Settings › Sync inboxes and labels (gb-prefs.js): a label synced for none lists nothing, Sync last N days only those
  // days of mail (counted from the newest message, the last sync).
  function synced(data, label, items, searching) {
    const v = data.appPrefs?.['gmail-sync'] || {}, choice = v[`sync|${label}`] ?? (['All Mail', 'Chats', 'Spam', 'Trash'].includes(label) ? 2 : 1);
    if (searching || choice === 0) return items;
    if (choice === 2) return [];
    const newest = Math.max(0, ...(data.gmail23 || []).flatMap(c => c.messages.map(m => m.created || 0))), since = newest - (Number(v.days) || 30) * D;
    return items.filter(c => c.messages.some(m => (m.created || 0) >= since));
  }
  // The list's date: the time for today's mail, the month and day this year, otherwise the numeric date.
  function when(created, ctx) {
    const d = new Date(created), now = ctx.now;
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString(ctx.locale, {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24});
    if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString(ctx.locale, {month: 'short', day: 'numeric'});
    return d.toLocaleDateString(ctx.locale, {year: '2-digit', month: 'numeric', day: 'numeric'});
  }
  // Senders: the distinct names (unread senders bold), "me" for the account, and the message count.
  function senders(c, lang) {
    const names = [];
    for (const m of c.messages) {
      const name = m.address === ACCOUNT ? T(lang, 'Me').toLocaleLowerCase() : c.messages.length > 1 ? m.from.split(' ')[0] : m.from;
      const found = names.find(n => n.name === name);
      if (found) found.unread ||= !c.read && m.address !== ACCOUNT; else names.push({name, unread: !c.read && m.address !== ACCOUNT});
    }
    return names.map(n => n.unread ? `<b>${e(n.name)}</b>` : e(n.name)).join(', ') + (c.messages.length > 1 ? ` (${c.messages.length})` : '') + (c.draft ? ` <i class="gmd">${e(T(lang, 'Drafts'))}</i>` : '');
  }
  const chip = (label, lang) => { const [fg, bg] = USER_LABELS[label] || ['#888888', '#eeeeee']; return `<i class="gm-chip" style="color:${fg};background:${bg};border-color:${fg}">${e(labelName(lang, label))}</i>`; };
  const userLabels = c => c.labels.filter(l => USER_LABELS[l]);
  // CanvasConversationHeaderView.getPersonalIndicator: the importance caret (double when only to me), read or unread.
  const caret = c => c.important ? `<img class="gm-caret" src="${ASSET(`ic_email_caret_${c.messages.length > 1 ? 'double' : 'single'}_important_${c.read ? 'read' : 'unread'}`)}" alt="">` : '';
  function titleBar(ctx, left, right = ACCOUNT, action = 'gm-labels') {
    return `<div class="gm-title"><button data-action="${action}">${e(left)}</button><button data-action="gm-accounts">${e(right)}</button></div>`;
  }
  function conversationList(ctx) {
    const {data, ui, lang} = ctx, mail = data.gmail23, label = ui.gmLabel || 'Inbox', selected = ui.gmSelected || [];
    const searching = ui.gmQuery !== undefined;
    const items = synced(data, label, list(mail, label, searching ? ui.gmQuery : ''), searching);
    const n = unread(mail, label);
    const rows = items.map(c => {
      const m = last(c), labels = label === 'Inbox' || USER_LABELS[label] ? userLabels(c).filter(l => l !== label) : userLabels(c);
      return `<div class="gm-row${c.read ? ' read' : ''}${selected.includes(c.id) ? ' checked' : ''}"><button class="gm-check" data-action="gm-select" data-id="${e(c.id)}" role="checkbox" aria-checked="${selected.includes(c.id)}" aria-label="${e(c.subject)}"></button><button class="gm-open" data-action="gm-open" data-id="${e(c.id)}"><span class="gm-line1"><span class="gm-subject">${e(c.subject)}</span><span class="gm-snippet"> ${e(m.body)}</span></span><span class="gm-line2">${caret(c)}<span class="gm-senders">${senders(c, lang)}</span>${labels.map(l => chip(l, lang)).join('')}<span class="gm-date">${e(when(m.created, ctx))}</span></span></button><button class="gm-star${c.starred ? ' on' : ''}" data-action="gm-star" data-id="${e(c.id)}" role="checkbox" aria-checked="${!!c.starred}" aria-label="${e(T(lang, c.starred ? 'Remove star' : 'Add star'))}"></button></div>`;
    }).join('');
    const empty = `<p class="gm-empty">${e(T(lang, 'No conversations.'))}</p>`;
    const search = searching ? `<form class="gm-search" data-form="gm-search"><input name="query" value="${e(ui.gmQuery)}" placeholder="${e(T(lang, 'Search'))}" aria-label="${e(T(lang, 'Search'))}" autocomplete="off"></form>` : '';
    const undo = ui.gmUndo ? `<div class="gm-undo"><span>${e(ui.gmUndo.text)}</span><button data-action="gm-undo">${e(T(lang, 'Undo'))}</button></div>` : '';
    const organize = selected.length ? `<div class="gm-bottombar">${['Archive', 'Delete', 'Labels'].map(a => `<button data-action="gm-${a.toLowerCase()}">${e(T(lang, a))}</button>`).join('')}</div>` : '';
    const title = searching ? T(lang, 'Search') : `${labelName(lang, label)}${n ? ` (${n})` : ''}`;
    return `<div class="app-view gm gm-list" data-no-translate>${titleBar(ctx, title)}${search}<div class="gm-scroll email-scroll">${undo}${rows || empty}</div>${organize}</div>`;
  }
  // HtmlConversationActivity: the WebView's conversation header and message cards (styles.css at 0.575 css px a device px).
  function conversation(ctx) {
    const {data, ui, lang, locale} = ctx, c = data.gmail23.find(x => x.id === ui.gmId);
    if (!c) return conversationList(ctx);
    const expanded = ui.gmExpanded || {};
    const cards = c.messages.map((m, i) => {
      const open = expanded[m.id] ?? (i === c.messages.length - 1);
      const mine = m.address === ACCOUNT, name = mine ? T(lang, 'Me').toLocaleLowerCase() : m.from, d = new Date(m.created);
      const date = d.toLocaleDateString(locale, {month: 'short', day: 'numeric'}), time = d.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24});
      const strip = ui.gmStrip === m.id;
      const actions = open ? `<div class="gm-strip${strip ? ' wide' : ''}">${strip ? [['reply', 'Reply'], ['reply_all', 'Reply all'], ['forward', 'Forward']].map(([icon, label]) => `<button class="gm-act" data-action="gm-${icon.replace('_', '-')}" data-id="${e(m.id)}"><img src="${ASSET(icon)}" alt=""><span>${e(T(lang, label))}</span></button>`).join('') : `<button class="gm-act" data-action="gm-reply-all" data-id="${e(m.id)}" aria-label="${e(T(lang, 'Reply all'))}"><img src="${ASSET('reply_all')}" alt=""></button>`}<button class="gm-more" data-action="gm-strip" data-id="${e(m.id)}" aria-label="${e(T(lang, 'Forward'))}"><img src="${ASSET(strip ? 'arrow_more_right' : 'arrow_more_left')}" alt=""></button></div>` : '';
      const details = ui.gmDetails === m.id;
      return `<div class="gm-msg${open ? ' open' : ''}"><div class="gm-head"><div class="gm-top"><button class="gm-toggle" data-action="gm-expand" data-id="${e(m.id)}" aria-expanded="${open}" aria-label="${e(name)}"></button><span class="gm-contact"><img src="${ASSET('ic_contact_picture')}" alt=""></span>${actions}${open ? '' : `<span class="gm-when"><b>${e(date)}</b><small>${e(time)}</small></span>`}<span class="gm-icons"><i class="gm-presence"></i></span><b class="gm-sender">${e(name)}</b><span class="gm-email">${e(mine ? ACCOUNT : m.address)}</span><i class="gm-sep"></i>${open ? '' : `<span class="gm-msnippet">${e(m.body)}</span>`}</div>${open ? `<div class="gm-bottom"><span class="gm-when"><b>${e(date)}</b><small>${e(time)}</small></span><button class="gm-details" data-action="gm-details" data-id="${e(m.id)}">${e(T(lang, details ? 'Hide details' : 'Show details'))}</button>${details ? `<table class="gm-recipients"><tr><td>${e(T(lang, 'To:'))}</td><td>${e(m.to === ACCOUNT ? T(lang, 'Me').toLocaleLowerCase() : m.to)}</td></tr>${m.cc ? `<tr><td>${e(T(lang, 'Cc:'))}</td><td>${e(m.cc)}</td></tr>` : ''}</table>` : ''}<i class="gm-sep"></i></div>` : ''}</div>${open ? `<div class="gm-body">${e(m.body).replace(/\n/g, '<br>')}</div>` : ''}</div>`;
    }).join('');
    const items = list(data.gmail23, ui.gmLabel || 'Inbox', ui.gmQuery), index = items.findIndex(x => x.id === c.id);
    const newer = index > 0 ? items[index - 1] : null, older = index >= 0 && index < items.length - 1 ? items[index + 1] : null;
    return `<div class="app-view gm gm-conv" data-no-translate><div class="gm-scroll gm-web"><div class="gm-subjecthead"><button class="gm-bigstar${c.starred ? ' on' : ''}" data-action="gm-star" data-id="${e(c.id)}" role="checkbox" aria-checked="${!!c.starred}" aria-label="${e(T(lang, c.starred ? 'Remove star' : 'Add star'))}"></button><div class="gm-subjecttext">${e(c.subject)}</div><div class="gm-labels">${c.labels.filter(l => !['Sent', 'Drafts', 'Outbox'].includes(l)).map(l => chip(l, lang)).join('')}${c.important ? chip('Important', lang) : ''}</div></div>${cards}</div><div class="gm-bottombar"><button data-action="gm-archive">${e(T(lang, 'Archive'))}</button><button data-action="gm-delete">${e(T(lang, 'Delete'))}</button><button class="gm-arrow left"${newer ? ` data-action="gm-open" data-id="${e(newer.id)}"` : ' disabled'} aria-label="${e(T(lang, 'Newer'))}"></button><button class="gm-arrow right"${older ? ` data-action="gm-open" data-id="${e(older.id)}"` : ' disabled'} aria-label="${e(T(lang, 'Older'))}"></button></div></div>`;
  }
  // image_attachment.xml: the #D5D5D5 row with ic_email_attachment, the 32 dp thumbnail 5 dp in, the black name and
  // size, and the framework's round btn_dialog to remove it.
  function attachmentRow(lang, item) {
    return `<div class="gm-attachment"><img class="gm-att-clip" src="assets/gb-gm-ic_email_attachment.png" alt=""><span class="gm-att-thumb">${window.ICSMedia && !item.vcard ? ICSMedia.art(item) : ''}</span><span class="gm-att-copy"><b>${e(item.name || 'IMG.jpg')}</b><b>${e(item.size || '')}</b></span><button type="button" class="gm-att-remove" data-action="gm-remove-attachment" aria-label="${e(T(lang, 'Remove'))}"></button></div>`;
  }
  function attach(ctx, photo) {
    if (!ctx.ui.gmDraft || !photo) return;
    ctx.ui.gmDraft.attachment = {...JSON.parse(JSON.stringify(photo)), size: photo.size || '214KB'};
  }
  function compose(ctx) {
    const {ui, lang} = ctx, d = ui.gmDraft || {};
    const field = (name, hint, extra = '') => `<input class="gm-field" name="${name}" value="${e(d[name] || '')}" placeholder="${e(T(lang, hint))}" aria-label="${e(T(lang, hint))}" autocomplete="off"${extra}>`;
    const head = d.mode ? `<button type="button" class="gm-picker" data-action="gm-mode">${e(T(lang, d.mode === 'reply' ? 'Reply' : d.mode === 'reply-all' ? 'Reply all' : 'Forward'))}</button>` : `<span class="gm-heading">${e(T(lang, 'Compose'))}</span>`;
    const quoted = d.quoted ? `<div class="gm-quoted-bar"><label><input type="checkbox" name="include" ${d.include !== false ? 'checked' : ''} data-action="gm-include"><span>${e(T(lang, 'Include text'))}</span></label><button type="button" data-action="gm-inline">${e(T(lang, 'Respond inline'))}</button></div><div class="gm-quoted${d.include === false ? ' off' : ''}">${e(d.quoted).replace(/\n/g, '<br>')}</div>` : '';
    return `<form class="app-view gm gm-compose" data-form="gm-compose" data-no-translate><div class="gm-ctitle">${head}<i class="gm-vdiv"></i><button type="submit" class="gm-send" aria-label="${e(T(lang, 'Send'))}"></button><i class="gm-vdiv"></i><button type="button" class="gm-save" data-action="gm-save" aria-label="${e(T(lang, 'Save draft'))}"></button></div><div class="gm-scroll gm-carea"><div class="gm-from"><span>${e(T(lang, 'From'))}</span><b>${e(ACCOUNT)}</b></div>${field('to', 'To', ' type="email" multiple')}${ui.gmCc ? field('cc', 'Cc') + field('bcc', 'Bcc') : ''}<i class="gm-hdiv"></i>${field('subject', 'Subject')}${d.attachment ? attachmentRow(lang, d.attachment) : ''}<textarea class="gm-field gm-bodyfield" name="body" placeholder="${e(T(lang, 'Compose Mail'))}" aria-label="${e(T(lang, 'Compose Mail'))}">${e(d.body || '')}</textarea>${quoted}</div></form>`;
  }
  function labels(ctx) {
    const {data, lang} = ctx, mail = data.gmail23;
    const rows = [...SYSTEM, ...Object.keys(USER_LABELS)].map(l => {
      const count = ['Drafts', 'Outbox'].includes(l) ? list(mail, l).length : ['Sent', 'All Mail', 'Spam', 'Trash', 'Chats'].includes(l) ? 0 : unread(mail, l);
      const [fg, bg] = USER_LABELS[l] || ['#ffffff', '#888888'];
      return `<button class="gm-label" data-action="gm-label" data-id="${e(l)}"><span>${e(labelName(lang, l))}</span>${count ? `<b style="background:${USER_LABELS[l] ? fg : bg}">${count}</b>` : ''}</button>`;
    }).join('');
    return `<div class="app-view gm gm-labelsview" data-no-translate><div class="gb-titlebar gm-wtitle">${e(T(lang, 'Labels'))}</div><div class="gm-scroll">${rows}</div></div>`;
  }
  function render(ctx) {
    if (ctx.ui.gmView === 'conversation') return conversation(ctx);
    if (ctx.ui.gmView === 'compose') return compose(ctx);
    if (ctx.ui.gmView === 'labels') return labels(ctx);
    return conversationList(ctx);
  }
  function menu(ctx) {
    const {ui, lang, data} = ctx, t = key => T(lang, key), g = name => `gm-${name}.png`;
    if (ui.gmView === 'compose') return [
      {action: 'gm-send', title: t('Send'), icon: 'ic_menu_send'}, {action: 'gm-save', title: t('Save draft'), icon: 'ic_menu_save'},
      {action: 'gm-cc', title: t(ui.gmCc ? 'Remove Cc/Bcc' : 'Add Cc/Bcc'), icon: g('ic_menu_cc')}, {action: 'gm-attach', title: t('Attach'), icon: g('ic_menu_attachment')},
      {action: 'gm-discard', title: t('Discard'), icon: 'ic_menu_close_clear_cancel'}, {action: 'gm-unsupported', title: t('Help'), icon: 'ic_menu_help'}];
    if (ui.gmView === 'labels') return [{action: 'gbpref-open', id: 'gmail', title: t('Settings'), icon: 'ic_menu_preferences'}, {action: 'gm-unsupported', title: t('Help'), icon: 'ic_menu_help'}];
    if (ui.gmView === 'conversation') {
      const c = data.gmail23.find(x => x.id === ui.gmId) || {};
      return [{action: 'gm-labels', title: t('Change labels'), icon: g('ic_menu_navigate')}, {action: 'gm-mark-unread', title: t('Mark unread'), icon: g('ic_menu_gmail_mark_unread')},
        {action: 'gm-important', title: t(c.important ? 'Not important' : 'Mark important'), icon: g(c.important ? 'ic_menu_mark_unimportant' : 'ic_menu_mark_important')},
        {action: 'gm-label', id: 'Inbox', title: t('Go to inbox'), icon: g('ic_menu_inbox')}, {action: 'gm-mute', title: t('Mute'), icon: g('ic_menu_mute')},
        {action: 'gm-star', id: c.id, title: t(c.starred ? 'Remove star' : 'Add star'), icon: g('ic_menu_star')}, {action: 'gm-spam', title: t('Report spam'), icon: g('ic_menu_report_spam')},
        {action: 'gbpref-open', id: 'gmail', title: t('Settings'), icon: 'ic_menu_preferences'}, {action: 'gm-unsupported', title: t('Help'), icon: 'ic_menu_help'}, {action: 'gb-select-text', title: t('Select text')}];
    }
    if ((ui.gmSelected || []).length) return [
      {action: 'gm-star-selected', title: t('Star'), icon: g('ic_menu_star')}, {action: 'gm-read-unread', title: t('Read/unread'), icon: g('ic_menu_gmail_mark_read')},
      {action: 'gm-important', title: t('Mark important'), icon: g('ic_menu_mark_important')}, {action: 'gm-spam', title: t('Report spam'), icon: g('ic_menu_report_spam')},
      {action: 'gm-mute', title: t('Mute'), icon: g('ic_menu_mute')}, {action: 'gm-deselect', title: t('Deselect all'), icon: g('ic_menu_gmail_deselect_mail')},
      {action: 'gm-unsupported', title: t('Help'), icon: 'ic_menu_help'}, {action: 'gm-about', title: t('About'), icon: 'ic_menu_info_details'}];
    return [{action: 'gm-refresh', title: t('Refresh'), icon: g('ic_menu_refresh')}, {action: 'gm-compose', title: t('Compose'), icon: g('ic_menu_compose')},
      {action: 'gm-accounts', title: t('Accounts'), icon: g('ic_mailboxes_accounts')}, {action: 'gm-labels', title: t('Go to labels'), icon: g('ic_menu_navigate')},
      {action: 'gm-search', title: t('Search'), icon: 'ic_menu_search'}, ...((ui.gmLabel || 'Inbox') !== 'Inbox' || ui.gmQuery !== undefined ? [{action: 'gm-label', id: 'Inbox', title: t('Go to inbox'), icon: g('ic_menu_inbox')}] : []),
      {action: 'gbpref-open', id: 'gmail', title: t('Settings'), icon: 'ic_menu_preferences'}, {action: 'gm-unsupported', title: t('Help'), icon: 'ic_menu_help'}, {action: 'gm-about', title: t('About')}];
  }
  // The Change labels check list, the account list, the reply-mode picker and the About box (InfoDialog).
  function dialog(kind, ctx) {
    const {ui, lang, data} = ctx, t = key => T(lang, key);
    if (kind === 'labels') return {title: t('Change labels'), items: ['Inbox', ...Object.keys(USER_LABELS)].map(l => ({action: 'gm-toggle-label', id: l, title: labelName(lang, l), checked: (ui.gmLabelDraft || []).includes(l)})), choice: 'multi', buttons: [{action: 'gm-labels-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'accounts') return {title: t('Accounts'), items: [{action: 'gm-label', id: 'Inbox', title: ACCOUNT, summary: `${labelName(lang, 'Inbox')} (${unread(data.gmail23, 'Inbox')})`}]};
    if (kind === 'mode') return {title: t('Reply'), items: [['reply', 'Reply'], ['reply-all', 'Reply all'], ['forward', 'Forward']].map(([id, label]) => ({action: 'gm-mode-pick', id, title: t(label)}))};
    if (kind === 'about') return {title: 'Gmail', custom: `<div class="gm-about"><img src="${ASSET('logo')}" alt="Gmail"><p>${e(AndroidStrings.format(t('Version %s'), VERSION))}</p><p>${e(AndroidStrings.format(t('©%d Google Inc.'), '2011'))}</p></div>`, buttons: [{action: 'close-overlay', title: ctx.ok}]};
    if (kind === 'discard') return {title: t('Discard'), icon: 'ic_dialog_alert', message: t('Your message has not been sent.\nDiscard your message?'), buttons: [{action: 'gm-discard-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    return null;
  }
  const plural = (lang, verb, n) => AndroidStrings.format(T(lang, `${verb} %1$d conversation${AndroidStrings.quantity(n) === 'one' ? '' : 's'}${verb === 'Reporting' ? ' as spam' : ''}.`), n);
  function handle(action, id, ctx) {
    const {data, ui, lang} = ctx, mail = data.gmail23;
    const targets = () => ui.gmView === 'conversation' ? [ui.gmId] : ui.gmSelected || [];
    // Archive / Delete / Mute / Report spam: back to the list with the undo bar.
    const bulk = (verb, change) => {
      const ids = targets(); if (!ids.length) return;
      const before = mail.filter(c => ids.includes(c.id)).map(c => [c.id, [...c.labels]]);
      mail.filter(c => ids.includes(c.id)).forEach(change);
      ui.gmUndo = {before, text: plural(lang, verb, ids.length)};
      ui.gmSelected = []; ui.gmView = ''; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render();
    };
    switch (action) {
      case 'gm-open': { const c = mail.find(x => x.id === id); if (!c) break; if (c.draft) { openDraft(ctx, c); break; } c.read = true; ui.gmId = id; ui.gmView = 'conversation'; ui.gmExpanded = Object.fromEntries(c.messages.map((m, i) => [m.id, i === c.messages.length - 1])); ui.gmStrip = ''; ui.gmDetails = ''; ui.gmUndo = null; ctx.save(); ctx.render(); break; }
      case 'gm-select': ui.gmSelected = (ui.gmSelected || []).includes(id) ? ui.gmSelected.filter(x => x !== id) : [...(ui.gmSelected || []), id]; ctx.render(); break;
      case 'gm-deselect': ui.gmSelected = []; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break;
      case 'gm-star': { const c = mail.find(x => x.id === (id || ui.gmId)); if (c) c.starred = !c.starred; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break; }
      case 'gm-star-selected': mail.filter(c => (ui.gmSelected || []).includes(c.id)).forEach(c => { c.starred = true; }); ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break;
      case 'gm-read-unread': { const sel = mail.filter(c => (ui.gmSelected || []).includes(c.id)), read = !sel.every(c => c.read); sel.forEach(c => { c.read = read; }); ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break; }
      case 'gm-mark-unread': { const c = mail.find(x => x.id === ui.gmId); if (c) c.read = false; ui.gmView = ''; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break; }
      case 'gm-important': { const sel = mail.filter(c => targets().includes(c.id)), value = !sel.every(c => c.important); sel.forEach(c => { c.important = value; }); ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break; }
      case 'gm-archive': bulk('Archiving', c => { c.labels = c.labels.filter(l => l !== 'Inbox'); }); break;
      case 'gm-delete': bulk('Deleting', c => { c.labels = ['Trash']; }); break;
      case 'gm-mute': bulk('Muting', c => { c.labels = [...c.labels.filter(l => l !== 'Inbox'), 'Muted']; }); break;
      case 'gm-spam': bulk('Reporting', c => { c.labels = ['Spam']; }); break;
      case 'gm-undo': for (const [cid, labels] of ui.gmUndo?.before || []) { const c = mail.find(x => x.id === cid); if (c) c.labels = labels; } ui.gmUndo = null; ctx.save(); ctx.render(); break;
      case 'gm-labels': {
        const ids = targets();
        if (ids.length) { ui.gmLabelDraft = [...new Set(mail.filter(c => ids.includes(c.id)).flatMap(c => c.labels).filter(l => l === 'Inbox' || USER_LABELS[l]))]; ctx.dialog('labels'); }
        else { ui.overlay = ''; ctx.renderOverlay(); ui.gmView = 'labels'; ctx.render(); }
        break;
      }
      case 'gm-toggle-label': ui.gmLabelDraft = (ui.gmLabelDraft || []).includes(id) ? ui.gmLabelDraft.filter(l => l !== id) : [...(ui.gmLabelDraft || []), id]; ctx.dialog('labels'); break;
      case 'gm-labels-ok': mail.filter(c => targets().includes(c.id)).forEach(c => { c.labels = [...c.labels.filter(l => l !== 'Inbox' && !USER_LABELS[l]), ...ui.gmLabelDraft]; }); ui.gmSelected = []; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break;
      case 'gm-label': ui.gmLabel = id; ui.gmView = ''; ui.gmSelected = []; ui.gmQuery = undefined; ui.gmUndo = null; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break;
      case 'gm-accounts': ctx.dialog('accounts'); break;
      case 'gm-about': ctx.dialog('about'); break;
      case 'gm-refresh': ui.overlay = ''; ctx.renderOverlay(); ctx.toast(T(lang, 'Refresh') + '…'); break;
      case 'gm-search': ui.overlay = ''; ctx.renderOverlay(); ui.gmQuery = ''; ui.gmView = ''; ctx.render(); ctx.focus('.gm-search input'); break;
      case 'gm-expand': ui.gmExpanded = {...(ui.gmExpanded || {}), [id]: !(ui.gmExpanded || {})[id]}; ctx.render(); break;
      case 'gm-strip': ui.gmStrip = ui.gmStrip === id ? '' : id; ctx.render(); break;
      case 'gm-details': ui.gmDetails = ui.gmDetails === id ? '' : id; ctx.render(); break;
      case 'gm-compose': ui.overlay = ''; ctx.renderOverlay(); startCompose(ctx, null); break;
      case 'gm-reply': case 'gm-reply-all': case 'gm-forward': startCompose(ctx, action.slice(3), id); break;
      case 'gm-mode': keep(ctx); ctx.dialog('mode'); break;
      case 'gm-mode-pick': { const d = ui.gmDraft; if (d) { const source = findMessage(mail, d.source); Object.assign(d, header(ctx, id, source)); } ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break; }
      case 'gm-include': keep(ctx); ui.gmDraft.include = !(ui.gmDraft.include !== false); ctx.render(); break;
      case 'gm-inline': keep(ctx); ui.gmDraft.body = `${ui.gmDraft.body || ''}\n\n${ui.gmDraft.quoted}`.replace(/^\n+/, ''); ui.gmDraft.quoted = ''; ctx.render(); break;
      case 'gm-cc': keep(ctx); ui.gmCc = !ui.gmCc; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break;
      // Attach: GET_CONTENT for a picture; the Gallery's picker hands it back (attach below).
      case 'gm-attach': keep(ctx); ui.overlay = ''; ctx.renderOverlay(); ctx.pickPicture(); break;
      case 'gm-remove-attachment': keep(ctx); if (ui.gmDraft) delete ui.gmDraft.attachment; ctx.render(); break;
      case 'gm-send': ui.overlay = ''; ctx.renderOverlay(); ctx.submit('.gm-compose'); break;
      case 'gm-save': keep(ctx); saveDraft(ctx); ui.gmView = ui.gmDraft?.source ? 'conversation' : ''; ui.gmDraft = null; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); ctx.toast(T(lang, 'Message saved as draft.')); break;
      case 'gm-discard': ctx.dialog('discard'); break;
      case 'gm-discard-ok': { const d = ui.gmDraft; if (d?.draftId) { const i = mail.findIndex(c => c.id === d.draftId); if (i >= 0) mail.splice(i, 1); } ui.gmView = d?.source ? 'conversation' : ''; ui.gmDraft = null; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); ctx.toast(T(lang, 'Message discarded.')); break; }
      case 'gm-unsupported': ui.overlay = ''; ctx.renderOverlay(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  const findMessage = (mail, mid) => { for (const c of mail) { const m = c.messages.find(x => x.id === mid); if (m) return {c, m}; } return null; };
  // The subject prefix, recipients and quoted text of a reply mode (ComposeActivity.initFromRefMessage).
  function header(ctx, mode, source) {
    const {lang, locale} = ctx;
    if (!source) return {mode: ''};
    const {c, m} = source, re = mode === 'forward' ? T(lang, 'Fwd:') : T(lang, 'Re:');
    const subject = c.subject.startsWith(re) ? c.subject : `${re} ${c.subject}`;
    const others = [...new Set(c.messages.map(x => x.address))].filter(a => a !== ACCOUNT && a !== m.address);
    const to = mode === 'forward' ? '' : m.address === ACCOUNT ? m.to : m.address;
    const when = new Date(m.created).toLocaleString(locale, {dateStyle: 'medium', timeStyle: 'short'});
    const quoted = mode === 'forward' ? `---------- Forwarded message ----------\nFrom: ${m.from} <${m.address}>\nDate: ${when}\nSubject: ${c.subject}\n\n${m.body}` : `${AndroidStrings.format(T(lang, 'On %s, %s wrote:'), when, `${m.from} <${m.address}>`)}\n> ${m.body}`;
    return {mode, to, cc: mode === 'reply-all' ? others.join(', ') : '', subject, quoted, include: true};
  }
  function startCompose(ctx, mode, mid) {
    const {ui, data} = ctx, source = mode ? findMessage(data.gmail23, mid || last(data.gmail23.find(c => c.id === ui.gmId) || {messages: [{}]}).id) : null;
    ui.gmDraft = {source: source?.m.id || '', body: '', ...(source ? header(ctx, mode, source) : {mode: ''})};
    ui.gmCc = !!ui.gmDraft.cc; ui.gmView = 'compose'; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); ctx.focus(mode && mode !== 'forward' ? '.gm-bodyfield' : '.gm-compose [name=to]');
  }
  function openDraft(ctx, c) {
    const m = c.messages[0];
    ctx.ui.gmDraft = {draftId: c.id, source: '', mode: '', to: m.to === ACCOUNT ? '' : m.to, cc: m.cc || '', subject: c.subject, body: m.body};
    ctx.ui.gmCc = !!m.cc; ctx.ui.gmView = 'compose'; ctx.render();
  }
  // Copies the compose fields into the draft before a re-render.
  function keep(ctx) {
    const form = ctx.root?.querySelector('.gm-compose'), d = ctx.ui.gmDraft; if (!form || !d) return;
    for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) { const f = form.querySelector(`[name=${key}]`); if (f) d[key] = f.value; }
  }
  function saveDraft(ctx) {
    const {data, ui} = ctx, d = ui.gmDraft; if (!d) return;
    const message = {id: `${d.draftId || 'gm-d' + Date.now()}-0`, from: 'me', address: ACCOUNT, to: d.to || '', cc: d.cc || '', body: d.body || '', created: Date.now()};
    const existing = data.gmail23.find(c => c.id === d.draftId);
    if (existing) { existing.subject = d.subject || ''; existing.messages = [message]; return; }
    const id = 'gm-d' + Date.now(); d.draftId = id;
    data.gmail23.unshift({id, subject: d.subject || '', labels: ['Drafts'], important: false, starred: false, read: true, draft: true, messages: [{...message, id: id + '-0'}]});
  }
  function submit(form, values, ctx) {
    const {data, ui, lang} = ctx;
    if (form === 'gm-search') { ui.gmQuery = String(values.get('query') || '').trim(); ctx.render(); return true; }
    if (form !== 'gm-compose') return false;
    const d = ui.gmDraft; if (!d) return true;
    for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) if (values.has(key)) d[key] = String(values.get(key)).trim();
    const recipients = [d.to, d.cc, d.bcc].join(',').split(',').map(s => s.trim()).filter(Boolean);
    if (!recipients.length) { ctx.toast(T(lang, 'Please add at least one recipient.')); return true; }
    const bad = recipients.find(a => !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(a));
    if (bad) { ctx.toast(AndroidStrings.format(T(lang, 'The address %s is invalid.'), bad)); return true; }
    const body = d.quoted && d.include !== false ? `${d.body}\n\n${d.quoted}` : d.body;
    const message = {id: 'gm-m' + Date.now(), from: 'me', address: ACCOUNT, to: d.to, cc: d.cc, body, created: Date.now()};
    if (d.draftId) { const i = data.gmail23.findIndex(c => c.id === d.draftId); if (i >= 0) data.gmail23.splice(i, 1); }
    const source = d.source && d.mode !== 'forward' ? findMessage(data.gmail23, d.source) : null;
    if (source) { source.c.messages.push(message); if (!source.c.labels.includes('Sent')) source.c.labels.push('Sent'); }
    else data.gmail23.unshift({id: 'gm-s' + Date.now(), subject: d.subject, labels: ['Sent'], important: false, starred: false, read: true, messages: [message]});
    ui.gmView = source ? 'conversation' : ''; ui.gmDraft = null; ctx.save(); ctx.render(); ctx.toast(T(lang, 'Sending message…'));
    return true;
  }
  // Back: compose saves its draft, the conversation and the labels return to the list, search closes.
  function back(ctx) {
    const {ui} = ctx;
    if (ui.overlay) return false;
    if (ui.gmView === 'compose') { keep(ctx); const d = ui.gmDraft; if (d && [d.to, d.subject, d.body].some(v => String(v || '').trim())) { saveDraft(ctx); ctx.toast(T(ctx.lang, 'Message saved as draft.')); } ui.gmView = d?.source ? 'conversation' : ''; ui.gmDraft = null; ctx.save(); ctx.render(); return true; }
    if (ui.gmView) { ui.gmView = ''; ctx.render(); return true; }
    if (ui.gmQuery !== undefined) { ui.gmQuery = undefined; ctx.render(); return true; }
    if ((ui.gmSelected || []).length) { ui.gmSelected = []; ctx.render(); return true; }
    if ((ui.gmLabel || 'Inbox') !== 'Inbox') { ui.gmLabel = 'Inbox'; ctx.render(); return true; }
    return false;
  }
  function open(ctx, resume) {
    const {data, ui} = ctx;
    data.gmail23 = restore(data.gmail23);
    if (!resume) { ui.gmView = ''; ui.gmLabel = 'Inbox'; ui.gmSelected = []; ui.gmQuery = undefined; ui.gmUndo = null; }
  }
  GBApps.register('gmail', {render, menu, dialog, handle, submit, back, open, keep});
  window.GBGmail = {ACCOUNT, restore, list, unread, attach, labelName};
})();
