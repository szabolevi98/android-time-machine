/* Android 4.4 Email: the first AOSP Email built on UnifiedEmail (packages/apps/Email + packages/apps/UnifiedEmail,
   android-4.4.4_r1; UnifiedEmailTheme = Theme.Holo.Light). Rebuilt from the sources:
   - MailActionBarView: the drawer indicator, the folder name over the account; Compose and Search as actions, Refresh /
     Settings / Help in the overflow (conversation_list_menu; Sync options, folder_options, is offered only where the
     service has offerLookback, Exchange, never for this IMAP account). In a conversation Delete and Mark unread
     are promoted (archive is unsupported for IMAP/POP), the rest overflows.
   - FolderListFragment (flat, not divided): the account row with its radio button and unread count, then the folders.
   - ConversationItemView (conversation_item_view_normal): a 48 dp sender image, LetterTileProvider tiles (first letter,
     sans-serif-light, colour from the address hash), the 18 sp sender and 12 sp date, the 13 sp two-line
     "subject — snippet", the star; list_unread_holo white rows and list_read_holo #eeeeee rows. Touching the sender
     image selects the conversation (ic_avatar_check) and opens the selection CAB.
   - The conversation view: the subject header with its star, the message header (photo, sender, "to me", date, reply
     and overflow) and the body.
   - ComposeActivity: From, To, optional Cc / Bcc, Subject and "Compose email"; Send in the bar, the rest in the overflow.
   Mail storage and actions are shared with the older Email (email.js, window.ICSEmail). 1 dp = 0.906 px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // Email / UnifiedEmail strings from the AOSP values, values-hu, -de, -fr and -es.
  const S = {
    'Inbox': {src: 'AOSP', hu: 'Beérkezett üzenetek', de: 'Posteingang', fr: 'Boîte de réception', es: 'Recibidos'},
    'Outbox': {src: 'AOSP', hu: 'Kimenő levelek', de: 'Postausgang', fr: 'Boîte d’envoi', es: 'Por enviar'},
    'Drafts': {res: 'PrebuiltEmailGoogle:mailbox_name_display_drafts', hu: 'Piszkozatok', de: 'Entwürfe', fr: 'Brouillons', es: 'Borradores'},
    'Sent': {res: 'PrebuiltEmailGoogle:mailbox_name_display_sent', hu: 'Elküldve', de: 'Gesendet', fr: 'Éléments envoyés', es: 'Enviados'},
    'Trash': {res: 'PrebuiltEmailGoogle:mailbox_name_display_trash', hu: 'Kuka', de: 'Papierkorb', fr: 'Corbeille', es: 'Papelera'},
    'Starred': {src: 'AOSP', hu: 'Csillagozott', de: 'Markiert', fr: 'Messages suivis', es: 'Destacados'},
    'Compose': {res: 'PrebuiltEmailGoogle:compose', hu: 'Levélírás', de: 'Schreiben', fr: 'Nouveau message', es: 'Redactar'},
    'Search': {res: 'PrebuiltEmailGoogle:menu_search', hu: 'Keresés', de: 'Suche', fr: 'Rechercher', es: 'Buscar'},
    'Refresh': {res: 'PrebuiltEmailGoogle:refresh', hu: 'Frissítés', de: 'Aktualisieren', fr: 'Actualiser', es: 'Actualizar'},
    'Sync options': {res: 'PrebuiltEmailGoogle:mailbox_settings_activity_title', hu: 'Szinkronizálási beállítások', de: 'Synchronisierungsoptionen', fr: 'Options de synchronisation', es: 'Ajustes de sincronización'},
    'Settings': {res: 'PrebuiltEmailGoogle:menu_settings', hu: 'Beállítások', de: 'Einstellungen', fr: 'Paramètres', es: 'Ajustes'},
    'Help': {res: 'PrebuiltEmailGoogle:help_and_info', hu: 'Súgó', de: 'Hilfe', fr: 'Aide', es: 'Ayuda'},
    'Mark read': {res: 'PrebuiltEmailGoogle:mark_read', hu: 'Megjelölés olvasottként', de: 'Als gelesen markieren', fr: 'Marquer comme lu', es: 'Marcar como leída'},
    'Mark unread': {res: 'PrebuiltEmailGoogle:mark_unread', hu: 'Megjelölés olvasatlanként', de: 'Als ungelesen markieren', fr: 'Marquer comme non lu', es: 'Marcar como no leída'},
    'Delete': {res: 'PrebuiltEmailGoogle:delete', hu: 'Törlés', de: 'Löschen', fr: 'Supprimer', es: 'Eliminar'},
    'Add star': {src: 'AOSP', hu: 'Csillagozás', de: 'Markieren', fr: 'Activer le suivi', es: 'Añadir estrella'},
    'Remove star': {src: 'AOSP', hu: 'Csillag eltávolítása', de: 'Markierung entfernen', fr: 'Désactiver le suivi', es: 'Eliminar estrella'},
    'Reply': {res: 'PrebuiltEmailGoogle:reply', hu: 'Válasz', de: 'Antworten', fr: 'Répondre', es: 'Responder'},
    'Reply all': {src: 'AOSP', hu: 'Válasz mind.', de: 'Allen antworten', fr: 'Répondre à tous', es: 'Responder a todos'},
    'Forward': {res: 'PrebuiltEmailGoogle:forward', hu: 'Továbbítás', de: 'Weiterleiten', fr: 'Transférer', es: 'Reenviar'},
    'Send': {res: 'PrebuiltEmailGoogle:send', hu: 'Küldés', de: 'Senden', fr: 'Envoyer', es: 'Enviar'},
    'Discard': {res: 'PrebuiltEmailGoogle:discard', hu: 'Elvetés', de: 'Verwerfen', fr: 'Supprimer', es: 'Descartar'},
    'Discard this message?': {res: 'PrebuiltEmailGoogle:confirm_discard_text', hu: 'Elveti ezt a levelet?', de: 'Nachricht verwerfen?', fr: 'Supprimer ce message ?', es: '¿Quieres descartar este mensaje?'},
    'Cancel': {res: 'PrebuiltEmailGoogle:cancel', hu: 'Mégse', de: 'Abbrechen', fr: 'Annuler', es: 'Cancelar'},
    'Attach file': {res: 'PrebuiltEmailGoogle:add_file_attachment', hu: 'Fájl csatolása', de: 'Datei anhängen', fr: 'Joindre un fichier', es: 'Adjuntar archivo'},
    'Save draft': {res: 'PrebuiltEmailGoogle:save_draft', hu: 'Piszkozat mentése', de: 'Entwurf speichern', fr: 'Enregistrer le brouillon', es: 'Guardar borrador'},
    'To': {res: 'PrebuiltEmailGoogle:to', hu: 'Címzett', de: 'An', fr: 'À', es: 'Para'},
    'Cc': {src: 'AOSP', hu: 'Másolatot kap', de: 'Cc', fr: 'Cc', es: 'Cc'},
    'Bcc': {src: 'AOSP', hu: 'Titkos másolat', de: 'Bcc', fr: 'Cci', es: 'Cco'},
    'Subject': {res: 'PrebuiltEmailGoogle:subject_hint', hu: 'Tárgy', de: 'Betreff', fr: 'Objet', es: 'Asunto'},
    'Compose email': {res: 'PrebuiltEmailGoogle:body_hint', hu: 'Levélírás', de: 'E-Mail schreiben', fr: 'Composez un message', es: 'Escribe tu correo'},
    'Add Cc/Bcc': {src: 'AOSP', hu: 'Másolatmezők', de: 'Cc/Bcc hinzufügen', fr: 'Ajouter Cc/Cci', es: 'Añadir Cc/Cco'},
    'Attach picture': {res: 'PrebuiltEmailGoogle:add_photo_attachment', hu: 'Kép csatolása', de: 'Bild anhängen', fr: 'Joindre une photo', es: 'Adjuntar imagen'},
    'Open navigation drawer': {res: 'PlayGames:games_dest_nav_drawer_open', hu: 'Navigációs fiók kinyitása', de: 'Navigationsleiste öffnen', fr: 'Ouvrir le panneau de navigation', es: 'Abrir control de navegación'},
    'Search email': {src: 'AOSP', hu: 'E-mail keresése', de: 'In E-Mails suchen', fr: 'Rechercher l’e-mail', es: 'Buscar correo'},
    'No messages.': {src: 'AOSP', hu: 'Nincsenek üzenetek.', de: 'Keine Nachrichten', fr: 'Aucun message', es: 'No hay ningún mensaje.'},
    'me': {src: 'AOSP', hu: 'nekem', de: 'ich', fr: 'moi', es: 'yo'},
    'To: ': {src: 'AOSP', hu: 'Címzett: ', de: 'An: ', fr: 'À : ', es: 'Para: '},
    'Message saved as draft.': {res: 'PrebuiltEmailGoogle:message_saved', hu: 'Az üzenet mentve piszkozatként.', de: 'Nachricht wurde als Entwurf gespeichert.', fr: 'Brouillon enregistré.', es: 'Mensaje guardado como borrador'},
    'Move to': {res: 'PrebuiltEmailGoogle:menu_move_to', hu: 'Áthelyezés ide:', de: 'Verschieben nach', fr: 'Déplacer vers', es: 'Mover a'},
    'Touch a sender image to select that conversation.': {res: 'PrebuiltEmailGoogle:conversation_photo_welcome_text', hu: 'A beszélgetés kiválasztásához érintse meg a küldő képét.', de: 'Auf Absenderbild tippen, um die entsprechende Konversation auszuwählen', fr: 'Appuyez sur l\'image d\'un expéditeur pour sélectionner la conversation.', es: 'Toca la imagen de un remitente para seleccionar esa conversación.'},
    'Dismiss tip': {res: 'PrebuiltEmailGoogle:dismiss_tip_hover_text', hu: 'Tipp elvetése', de: 'Tipp schließen', fr: 'Masquer le conseil', es: 'Ignorar sugerencia'},
    'Archive': {res: 'PrebuiltEmailGoogle:archive', hu: 'Archiválás', de: 'Archivieren', fr: 'Archiver', es: 'Archivar'}
  };
  // The text of the app on show: Gmail's (StockStrings.gmailui) or Email's (LPEmailStrings.email) from the image, else the row.
  const STR = AndroidStrings.table('', S), tr = (lang, key, app) => { const row = app === 'gmail' ? window.StockStrings?.gmailui?.[key] : app === 'email' ? window.LPEmailStrings?.email?.[key] : null; return row ? AndroidStrings.pick(row, lang, key) : STR.t(key, lang); };
  const FOLDERS = ['Inbox', 'Starred', 'Drafts', 'Outbox', 'Sent', 'Trash'];
  const ICON = name => `<img src="assets/kem-${name}.png" alt="">`;
  // LetterTileProvider: Java String.hashCode of the address picks one of the eight letter_tile_colors.
  const TILE_COLORS = ['#f16364', '#f58559', '#f9a43e', '#e4c62e', '#67bf74', '#59a2be', '#2093cd', '#ad62a7'];
  function hash(text) { let h = 0; for (const ch of String(text)) for (let i = 0; i < ch.length; i++) h = (h * 31 + ch.charCodeAt(i)) | 0; return h; }
  function tile(name, address, cls = 'kem-tile') {
    const first = String(name || address || '').trim().charAt(0);
    const color = TILE_COLORS[Math.abs(hash(address || name)) % TILE_COLORS.length];
    return /\p{L}/u.test(first) ? `<span class="${cls}" style="background:${color}" aria-hidden="true">${e(first.toLocaleUpperCase())}</span>` : `<span class="${cls} generic" aria-hidden="true">${ICON('ic_generic_man')}</span>`;
  }
  // FormattedDateBuilder.formatShortDate: today's messages show the time, older ones "MMM d".
  function shortDate(item, locale, now = Date.now()) {
    if (item.created) {
      const d = new Date(item.created), today = new Date(now);
      return d.toDateString() === today.toDateString() ? d.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}) : d.toLocaleDateString(locale, {month: 'short', day: 'numeric'});
    }
    if (item.time === 'Yesterday') return new Date(now - 864e5).toLocaleDateString(locale, {month: 'short', day: 'numeric'});
    return item.time || '';
  }
  const bar = (left, title, sub, actions) => `<header class="kem-bar">${left}<span class="kem-title"><b>${e(title)}</b>${sub ? `<small>${e(sub)}</small>` : ''}</span>${actions}</header>`;
  const act = (action, label, icon, id = '') => `<button type="button" class="kem-act" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}">${ICON(icon)}</button>`;
  const overflow = menu => `<button type="button" class="kem-act" data-action="email-menu" data-id="${menu}" aria-label="More options">${ICON('ic_menu_moreoverflow_normal_holo_light')}</button>`;
  let appIcon = 'email.png';
  const upHome = (ctx, action = 'email-list') => `<button type="button" class="kem-up" data-action="${action}" aria-label="Back">${ICON('ic_up_holo_light')}<img src="assets/${appIcon}" alt=""></button>`;
  // ConversationPhotoTeaserView: the arrow, the light 16 sp tip, a separator and the dismiss button, until dismissed.
  const photoTeaser = T => `<div class="kem-teaser"><img class="kem-teaser-arrow" src="assets/kem-ic_arrow.png" alt=""><span>${e(T('Touch a sender image to select that conversation.'))}</span><i></i><button type="button" data-action="email-dismiss-teaser" aria-label="${e(T('Dismiss tip'))}">${ICON('ic_cancel_holo_light')}</button></div>`;

  // opts lets Gmail (gmail.js) reuse the UnifiedEmail screens: its icon, account, label lists, Primary teasers,
  // importance markers, Archive and the label chip.
  function render(mail, ui, t, locale, lang, opts = {}) {
    const T = key => tr(lang, key, opts.app), account = opts.account || window.ICSEmail.account;
    appIcon = opts.icon || 'email.png';
    const listOf = opts.list || window.ICSEmail.list, name = opts.folderName || (folder => T(folder));
    const folder = ui.emailFolder || 'Inbox', selected = ui.emailSelected || [], item = mail.find(m => m.id === ui.emailId);
    if (ui.sub === 'compose' && item) {
      const field = (key, label) => `<label class="kem-field"><input type="text" name="${key}" value="${e(item[key] || '')}" placeholder="${e(T(label))}" aria-label="${e(T(label))}"${key === 'subject' ? ' maxlength="160"' : ''}></label>`;
      const cc = ui.emailCc || item.cc || item.bcc;
      return `<form class="app-view kem kem-compose email-compose" data-form="email">${bar(upHome(), T('Compose'), '', `<button type="submit" class="kem-act" aria-label="${e(T('Send'))}">${ICON('ic_menu_send_holo_light')}</button>${overflow('compose')}`)}<div class="email-scroll kem-scroll"><div class="kem-from">${e(item.from === window.ICSEmail.account ? account : item.address || account)}</div>${field('to', 'To')}${cc ? field('cc', 'Cc') + field('bcc', 'Bcc') : ''}${field('subject', 'Subject')}<label class="kem-body"><textarea name="body" placeholder="${e(T('Compose email'))}" aria-label="${e(T('Compose email'))}" maxlength="10000">${e(item.body)}</textarea></label>${item.attachment ? `<div class="kem-attachment">${window.ICSMedia.art(item.attachment)}<span>${e(item.attachment.name)}</span><button type="button" data-action="email-remove-attachment" aria-label="${e(T('Discard'))}">×</button></div>` : ''}${ui.emailError ? `<p class="kem-error">${e(t(ui.emailError))}</p>` : ''}</div></form>`;
    }
    if (ui.sub === 'read' && item) {
      const trashLike = item.folder === 'Trash';
      const actions = (opts.archive && item.folder === 'Inbox' ? act('email-archive', T('Archive'), 'ic_menu_archive_holo_light') : '') + (trashLike ? act('email-restore', T('Move to'), 'ic_menu_move_to_holo_light') : act('email-trash', T('Delete'), 'ic_menu_trash_holo_light')) + act('email-unread', T('Mark unread'), 'ic_menu_mark_unread_holo_light') + overflow('conversation');
      const sent = item.folder === 'Sent' || item.folder === 'Drafts';
      const to = sent ? item.to || '' : T('me');
      return `<div class="app-view kem kem-conversation">${bar(upHome(), opts.archive ? '' : name(folder), '', actions)}<div class="email-scroll kem-scroll"><div class="kem-subject"><h2>${e(item.subject || '')}</h2>${opts.chip ? opts.chip(item) : ''}<button class="kem-conv-star" data-action="email-star" data-id="${e(item.id)}" aria-label="${e(T(item.starred ? 'Remove star' : 'Add star'))}" aria-pressed="${item.starred}">${ICON(item.starred ? 'ic_star_on_convo_view_holo_light' : 'ic_star_off_convo_view_holo_light')}</button></div><article class="kem-message"><div class="kem-msg-head">${tile(item.from, item.address)}<span class="kem-msg-who"><b>${e(item.from)}</b><small>${e(T('To: ').trimEnd())} ${e(to)}</small></span><span class="kem-msg-date">${e(shortDate(item, locale))}</span><button class="kem-msg-act" data-action="email-reply" aria-label="${e(T('Reply'))}">${ICON('ic_reply_holo_light')}</button><button class="kem-msg-act" data-action="email-menu" data-id="message" aria-label="More options">${ICON('ic_menu_moreoverflow_normal_holo_light')}</button></div><div class="kem-msg-body">${e(item.body).replace(/\n/g, '<br>')}</div>${item.attachment ? `<div class="kem-attachment">${window.ICSMedia.art(item.attachment)}<span>${e(item.attachment.name)}</span></div>` : ''}</article></div></div>`;
    }
    const rows = listOf(mail, folder, ui.emailQuery || '');
    const head = selected.length
      ? `<header class="kem-bar cab"><button type="button" class="kem-cab-done" data-action="email-clear-selection" aria-label="Done">${ICON('ic_cab_done_holo_light')}</button><span class="kem-title"><b>${selected.length}</b></span>${opts.archive && folder !== 'Trash' ? act('email-selected-archive', T('Archive'), 'ic_menu_archive_holo_light') : ''}${folder === 'Trash' ? act('email-selected-restore', T('Move to'), 'ic_menu_move_to_holo_light') : act('email-selected-trash', T('Delete'), 'ic_menu_trash_holo_light')}${act('email-selected-read', T('Mark read'), 'ic_menu_mark_read_holo_light')}</header>`
      : ui.emailQuery !== undefined
        ? `<form class="kem-bar kem-searchbar" data-form="email-search">${upHome(null, 'email-list')}<input name="query" value="${e(ui.emailQuery)}" placeholder="${e(T('Search email'))}" aria-label="${e(T('Search email'))}" autocomplete="off"><button type="submit" class="kem-act" aria-label="${e(T('Search'))}">${ICON('ic_menu_search_holo_light')}</button></form>`
        : bar(`<button type="button" class="kem-up kem-nav" data-action="email-drawer" aria-label="${e(T('Open navigation drawer'))}">${ICON('ic_drawer')}<img src="assets/${appIcon}" alt=""></button>`, name(folder), opts.subtitle ? opts.subtitle(folder) : account, act('email-compose', T('Compose'), 'ic_menu_compose_normal_holo_light') + act('email-search', T('Search'), 'ic_menu_search_holo_light') + overflow('list'));
    const row = m => {
      const on = selected.includes(m.id), who = m.folder === 'Sent' || m.folder === 'Drafts' ? (m.to || m.from) : m.from;
      return `<div class="kem-row ${m.read ? 'read' : 'unread'}${on ? ' selected' : ''}"><button class="kem-photo" data-action="email-select" data-id="${e(m.id)}" role="checkbox" aria-checked="${on}" aria-label="${e(who)}">${on ? `<span class="kem-tile checked">${ICON('ic_avatar_check')}</span>` : tile(who, m.folder === 'Sent' ? m.to : m.address)}</button><button class="kem-row-main" data-action="email-read" data-id="${e(m.id)}"><span class="kem-line1">${opts.marker ? opts.marker(m) : ''}<b class="kem-senders">${m.folder === 'Drafts' ? `<span class="kem-draft">${e(T('Drafts'))}</span>` : e(who)}</b>${m.attachment ? `<i class="kem-clip">${ICON('ic_attachment_holo_light')}</i>` : ''}<span class="kem-date">${e(shortDate(m, locale))}</span></span><span class="kem-line2"><span class="kem-subj">${e(m.subject || '')}</span>${m.body ? ` — <span class="kem-snippet">${e(m.body.replace(/\s+/g, ' '))}</span>` : ''}</span></button><button class="kem-star" data-action="email-star" data-id="${e(m.id)}" aria-label="${e(T(m.starred ? 'Remove star' : 'Add star'))}" aria-pressed="${m.starred}">${ICON(m.starred ? 'ic_btn_star_on' : 'ic_btn_star_off')}</button></div>`;
    };
    const plain = !selected.length && ui.emailQuery === undefined;
    const top = plain && opts.top ? opts.top(folder) : '', teaser = plain && rows.length && !opts.teaserDismissed ? photoTeaser(T) : '';
    return `<div class="app-view kem kem-list${opts.archive ? ' gm-list' : ''}">${head}<div class="email-scroll kem-scroll">${top}${teaser}${rows.length ? rows.map(row).join('') : `<p class="kem-empty">${e(T('No messages.'))}</p>`}</div></div>`;
  }
  // The drawer (under the action bar), the overflow menus and the photo picker / discard dialogs.
  function overlay(mail, ui, photos, t, lang, opts = {}) {
    const T = key => tr(lang, key, opts.app), account = window.ICSEmail.account, folder = ui.emailFolder || 'Inbox';
    const unread = name => window.ICSEmail.list(mail, name).filter(m => !m.read).length;
    if (ui.overlay === 'email-drawer' && opts.drawer) return opts.drawer();
    if (ui.overlay === 'email-drawer') {
      const total = unread('Inbox');
      return `<div class="kem-drawer-scrim" data-action="close-overlay"></div><nav class="kem-drawer" aria-label="${e(T('Open navigation drawer'))}"><button class="kem-account" data-action="close-overlay">${ICON('ic_radiobutton_selected')}<span>${e(account)}</span>${total ? `<em>${total}</em>` : ''}</button>${FOLDERS.map(name => { const n = name === 'Drafts' || name === 'Outbox' ? window.ICSEmail.list(mail, name).length : unread(name); return `<button class="kem-folder${name === folder ? ' on' : ''}" data-action="email-folder" data-id="${name}"><span>${e(T(name))}</span>${n ? `<em>${n}</em>` : ''}</button>`; }).join('')}</nav>`;
    }
    const menu = items => `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu kem-menu">${items.map(([action, label]) => `<button data-action="${action}">${e(T(label))}</button>`).join('')}</div>`;
    if (ui.overlay === 'email-menu') {
      const kind = ui.emailMenu || 'list';
      if (kind === 'compose') return menu([['email-attach', 'Attach picture'], ['email-cc', 'Add Cc/Bcc'], ['email-save', 'Save draft'], ['email-discard', 'Discard'], ['email-settings', 'Settings'], ['email-unavailable', 'Help']]);
      if (kind === 'conversation') return menu([['email-folders', 'Move to'], ['email-settings', 'Settings'], ['email-unavailable', 'Help']]);
      if (kind === 'message') return menu([['email-reply-all', 'Reply all'], ['email-forward', 'Forward']]);
      return menu([['email-refresh', 'Refresh'], ['email-settings', 'Settings'], ['email-unavailable', 'Help']]);
    }
    if (ui.overlay === 'email-folders') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="kem-dialog" role="dialog" aria-label="${e(T('Move to'))}"><h3>${e(T('Move to'))}</h3>${['Inbox', 'Drafts', 'Sent', 'Trash'].map(name => `<button data-action="email-move" data-id="${name}">${e(T(name))}</button>`).join('')}</div>`;
    // The picture list for Attach picture (until the GET_CONTENT chooser is built) and ComposeActivity's
    // DiscardConfirmDialogFragment: confirm_discard_text with Discard and Cancel, no title.
    if (ui.overlay === 'email-attach') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog email-photo-picker" role="dialog" aria-label="${e(T('Attach picture'))}"><h3>${e(T('Attach picture'))}</h3><div>${photos.map(photo => `<button data-action="email-attach-photo" data-id="${photo.id}">${window.ICSMedia.art(photo)}<span>${e(photo.name)}</span></button>`).join('')}</div><button data-action="close-overlay">${e(T('Cancel'))}</button></div>`;
    if (ui.overlay === 'email-discard') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="kem-dialog kem-confirm" role="alertdialog" aria-label="${e(T('Discard this message?'))}"><p>${e(T('Discard this message?'))}</p><div class="kem-confirm-buttons"><button data-action="close-overlay">${e(T('Cancel'))}</button><button data-action="email-confirm-discard">${e(T('Discard'))}</button></div></div>`;
    return '';
  }
  window.KKEmail = {S, tr, TILE_COLORS, hash, tile, shortDate, render, overlay};
})();

// ---- Lollipop Email over the UnifiedEmail screens above ----
/* Gmail 5.0.2 and Email 7.0 on the Nexus 6 (LMY48Y): both are the Material UnifiedEmail. Rebuilt from their resources:
   - the 56 dp toolbar in the app colour (Gmail #DA4336 over #B93221, Email #E7790D over #D06D0C) with the drawer
     button, the 20 sp folder name and Search; selection turns it into the contextual bar;
   - ConversationItemView: 16 dp in, the 40 dp round LetterTileProvider tile (Gmail's ten letter_tile_colors), the 18 sp
     #212121 senders (bold when unread) with the 12 sp date (#4285F4 when unread, #757575 read), the 14 sp subject and
     the #757575 snippet, the star at the end; Gmail's personal-level carets before the senders;
   - the compose FAB (56 dp, compose_button_background_color, the white pencil) 16 dp from the corner;
   - the 264 dp drawer: the 147 dp account header over the blue cover with the 64 dp avatar, then the folders with
     their 24 dp icons, the selected one on #12000000 in the app colour;
   - the conversation: Archive, Delete, Mark unread on the toolbar, the 20 sp subject with its label chip and the star,
     the message header (40 dp tile, sender, "to me", date, reply and overflow) and the body;
   - ComposeActivity: the toolbar with attach and send, From / To / Subject rows with #757575 labels, "Compose email".
   - the menus as Email 7.0's code leaves them (ActionBarController, MessageHeaderView; read from its odex): the list
     toolbar has only Search (Refresh, Settings and Help are keyboard shortcuts; Settings and Help sit in the drawer),
     "Empty Trash" over a non-empty trash, "Move to" in the conversation's overflow, Reply all / Forward / star / Print
     in the message's; the empty-list pictures and texts of ConversationListEmptyView;
   Mail storage and actions are shared with email.js (window.ICSEmail). The texts are each app's own
   (lp-email-strings.js from docs/tools/lp-email-strings.py); the 4.4 part above still draws the photo picker and the
   discard prompt. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const TILE_COLORS = ['#f9a825', '#ff6e40', '#f06292', '#e06055', '#9e9e9e', '#b388ff', '#9575cd', '#4dd0e1', '#00bfa5', '#00c853'];
  function hash(text) { let h = 0; for (const ch of String(text)) for (let i = 0; i < ch.length; i++) h = (h * 31 + ch.charCodeAt(i)) | 0; return h; }
  function tile(name, address, cls = 'lem-tile') {
    const first = String(name || address || '').trim().charAt(0);
    const color = TILE_COLORS[Math.abs(hash(address || name)) % TILE_COLORS.length];
    return /\p{L}/u.test(first) ? `<span class="${cls}" style="background:${color}" aria-hidden="true">${e(first.toLocaleUpperCase())}</span>` : `<span class="${cls}" style="background:#f48fb1" aria-hidden="true"><img src="assets/gd-ic_person_white_120dp.png" alt=""></span>`;
  }
  const THEMES = {email: {primary: '#e7790d', dark: '#d06d0c', name: 'Email'}, gmail: {primary: '#da4336', dark: '#b93221', name: 'Gmail'}};
  const icon = name => `<img src="assets/gm5-${name}.png" alt="">`;
  /* compose_attachments.xml: pictures in the AttachmentTileGrid (compose_attachment_tile.xml: the centerCrop preview on
     attachment_bg_color under the #7f000000 band with the name in 16 sp and the size in 12 sp, white, and the 44 dp
     ic_cancel_wht_24dp), other files as attachment.xml rows (48 dp on attachment_bg_holo: ic_attach_file_18dp, the
     name in #333333 and the size in 12 sp #949494, the 48 dp ic_cancel_holo_light). In the conversation a file is a
     conversation_message_attachment_bar (ic_menu_attachment_holo_light on #e5e5e5, 14 sp #333333, 12 sp #aaaaaa).
     AttachmentUtils.convertToHumanReadableSize: "%s B", whole "%s KB", "%s MB" with one decimal place. */
  function bytes(size, T, locale) {
    if (size < 1024) return AndroidStrings.format(T('%s B'), size);
    if (size < 1048576) return AndroidStrings.format(T('%s KB'), Math.floor(size / 1024));
    return AndroidStrings.format(T('%s MB'), Number((size / 1048576).toFixed(1)).toLocaleString(locale));
  }
  function attachments(item, T, locale, compose) {
    const picture = item.attachment ? [{name: item.attachment.name, mime: 'image/jpeg', size: window.LPDocPicker?.photoDoc(item.attachment).size || 0, photo: item.attachment, remove: 'email-remove-attachment', id: ''}] : [];
    const list = [...picture, ...(item.files || []).map((file, i) => ({...file, remove: 'email-remove-file', id: String(i)}))];
    if (!list.length) return '';
    const x = (file, img) => compose ? `<button type="button" class="lem-att-x" data-action="${file.remove}"${file.id ? ` data-id="${file.id}"` : ''} aria-label="${e(AndroidStrings.format(T('Remove attachment %s'), file.name))}">${icon(img)}</button>` : '';
    const tiles = list.filter(file => file.photo && file.mime.startsWith('image/')).map(file => `<div class="lem-att-tile"><span class="lem-att-tile-art">${window.ICSMedia.art(file.photo)}</span><div class="lem-att-tile-band"><span><b>${e(file.name)}</b><small>${e(bytes(file.size, T, locale))}</small></span>${x(file, 'ic_cancel_wht_24dp')}</div></div>`).join('');
    const rows = list.filter(file => !(file.photo && file.mime.startsWith('image/'))).map(file => compose
      ? `<div class="lem-file">${icon('ic_attach_file_18dp')}<span><b>${e(file.name)}</b><small>${e(bytes(file.size, T, locale))}</small></span>${x(file, 'ic_cancel_holo_light')}</div>`
      : `<div class="lem-file-bar"><span class="lem-file-icon">${icon('ic_menu_attachment_holo_light')}</span><span><b>${e(file.name)}</b><small>${e(bytes(file.size, T, locale))}</small></span></div>`).join('');
    return `<div class="lem-attachments">${tiles ? `<div class="lem-tiles">${tiles}</div>` : ''}${rows}</div>`;
  }
  const act = (action, label, name, id = '') => `<button type="button" class="lem-act" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}">${icon(name)}</button>`;
  const overflow = (menu, dark = false) => `<button type="button" class="lem-act${dark ? ' dark' : ''}" data-action="email-menu" data-id="${menu}" aria-label="More options">${icon('ic_overflow_24dp')}</button>`;
  const FOLDER_ICONS = {Inbox: 'inbox', Primary: 'primary', Social: 'social', Promotions: 'promotions', Updates: 'updates', Forums: 'forums', 'Priority Inbox': 'priority', Starred: 'starred', Important: 'important', Chats: 'allmail', Sent: 'sent', Outbox: 'outbox', Drafts: 'drafts', 'All mail': 'allmail', Spam: 'spam', Trash: 'trash'};
  // The app's own texts (lp-email-strings.js, from PrebuiltEmailGoogle 7.0 / PrebuiltGmail 5.0.2), else the shared rows.
  const text = (app, lang, key, t) => { const row = window.LPEmailStrings?.[app]?.[key]; return row ? AndroidStrings.pick(row, lang, key) : t ? t(key) : window.AndroidI18n?.t?.(key) ?? key; };
  /* ConversationListEmptyView (EmptyStateUtils): the 120 dp ic_empty_* picture and the 20 sp sans-serif-light #757575
     text, 228 dp wide and 16 dp below it, for the inbox, search results, spam, trash or any other folder. */
  function emptyView(app, folder, query, T) {
    const [pic, key] = query !== undefined ? ['search', 'Empty search'] : folder === 'Inbox' || folder === 'Primary' ? ['inbox', 'Empty inbox'] : folder === 'Spam' ? ['spam', 'Empty spam'] : folder === 'Trash' ? ['trash', 'Empty trash'] : ['default', 'Empty folder'];
    return `<div class="lem-empty-view"><img src="assets/${app === 'gmail' ? 'gm5' : 'em7'}-ic_empty_${pic}.png" alt=""><p>${e(AndroidStrings.format(T(key), query || ''))}</p></div>`;
  }
  function render(mail, ui, t, locale, lang, opts = {}) {
    const app = opts.app || 'email', T = key => text(app, lang, key, t), account = opts.account || window.ICSEmail.account;
    const theme = THEMES[opts.app || 'email'];
    const listOf = opts.list || window.ICSEmail.list, name = opts.folderName || (folder => T(folder));
    const folder = ui.emailFolder || (opts.app === 'gmail' ? 'Primary' : 'Inbox'), selected = ui.emailSelected || [], item = mail.find(m => m.id === ui.emailId);
    const style = `--lem:${theme.primary};--lem-dark:${theme.dark}`;
    if (ui.sub === 'compose' && item) {
      const cc = ui.emailCc || item.cc || item.bcc;
      // compose_recipients.xml: the add_cc_bcc chevron (ic_expand_more_24dp) beside To while Cc / Bcc are hidden.
      const field = (key, label) => `<label class="lem-field"><span>${e(T(label))}</span><input type="text" name="${key}" value="${e(item[key] || '')}" aria-label="${e(T(label))}"${key === 'subject' ? ' maxlength="160"' : ''}>${key === 'to' && !cc ? `<button type="button" class="lem-ccbtn" data-action="email-cc" aria-label="${e(T('+ Cc/Bcc'))}"><img src="assets/gm5-ic_expand_more_24dp.png" alt=""></button>` : ''}</label>`;
      return `<form class="app-view lem lem-compose email-compose" style="${style}" data-form="email"><header class="lem-bar">${act('email-list', T('Navigate up'), 'ic_arrow_back_wht_24dp')}<h2>${e(T('Compose'))}</h2>${act('email-menu', T('Attach file'), 'ic_attach_file_wht_24dp', 'attach')}<button type="submit" class="lem-act" aria-label="${e(T('Send'))}">${icon('ic_send_wht_24dp')}</button>${overflow('compose')}</header><div class="email-scroll lem-scroll"><div class="lem-field lem-from"><span>${e(T('From'))}</span><b>${e(item.from === window.ICSEmail.account ? account : item.address || account)}</b></div>${field('to', 'To')}${cc ? field('cc', 'Cc') + field('bcc', 'Bcc') : ''}<label class="lem-field lem-subject-field"><input type="text" name="subject" value="${e(item.subject || '')}" placeholder="${e(T('Subject'))}" aria-label="${e(T('Subject'))}" maxlength="160"></label><label class="lem-body"><textarea name="body" placeholder="${e(T('Compose email'))}" aria-label="${e(T('Compose email'))}" maxlength="10000">${e(item.body)}</textarea></label>${attachments(item, T, locale, true)}${ui.emailError ? `<p class="lem-error">${e(t(ui.emailError))}</p>` : ''}</div></form>`;
    }
    if (ui.sub === 'read' && item) {
      const trashLike = item.folder === 'Trash';
      const actions = (opts.archive && item.folder === 'Inbox' ? act('email-archive', T('Archive'), 'ic_archive_wht_24dp') : '') + (trashLike ? act('email-restore', T('Move to'), 'ic_move_to_wht_24dp') : act('email-trash', T('Delete'), 'ic_delete_wht_24dp')) + act('email-unread', T('Mark unread'), 'ic_mark_unread_wht_24dp') + overflow('conversation');
      const sent = item.folder === 'Sent' || item.folder === 'Drafts';
      const to = sent ? item.to || '' : T('me');
      return `<div class="app-view lem lem-conversation" style="${style}"><header class="lem-bar">${act('email-list', T('Navigate up'), 'ic_arrow_back_wht_24dp')}<span class="lem-spacer"></span>${actions}</header><div class="email-scroll lem-scroll"><div class="lem-subject"><h2>${e(item.subject || '')}${opts.chip ? opts.chip(item) : ''}</h2><button class="lem-conv-star" data-action="email-star" data-id="${e(item.id)}" aria-label="${e(T(item.starred ? 'Remove star' : 'Add star'))}" aria-pressed="${item.starred}">${icon(item.starred ? 'ic_star_20dp' : 'ic_star_outline_20dp')}</button></div><article class="lem-message"><div class="lem-msg-head">${tile(item.from, item.address)}<span class="lem-msg-who"><b>${e(item.from)}</b><small>${e(AndroidStrings.format(T('to %1$s'), to))} · ${e(window.KKEmail.shortDate(item, locale))}</small></span><button class="lem-msg-act" data-action="email-reply" aria-label="${e(T('Reply'))}">${icon('ic_reply_24dp')}</button><button class="lem-msg-act narrow" data-action="email-menu" data-id="message" aria-label="More options">${icon('ic_overflow_24dp')}</button></div><div class="lem-msg-body">${e(item.body).replace(/\n/g, '<br>')}</div>${attachments(item, T, locale, false)}<div class="lem-msg-footer"><button data-action="email-reply">${icon('ic_reply_24dp')}<span>${e(T('Reply'))}</span></button><button data-action="email-reply-all">${icon('ic_reply_all_24dp')}<span>${e(T('Reply all'))}</span></button><button data-action="email-forward">${icon('ic_forward_24dp')}<span>${e(T('Forward'))}</span></button></div></article></div></div>`;
    }
    const rows = listOf(mail, folder, ui.emailQuery || '');
    const head = selected.length
      ? `<header class="lem-bar cab">${act('email-clear-selection', 'Done', 'ic_arrow_back_wht_24dp')}<h2>${selected.length}</h2>${opts.archive && folder !== 'Trash' ? act('email-selected-archive', T('Archive'), 'ic_archive_wht_24dp') : ''}${folder === 'Trash' ? act('email-selected-restore', T('Move to'), 'ic_move_to_wht_24dp') : act('email-selected-trash', T('Delete'), 'ic_delete_wht_24dp')}${act('email-selected-read', T('Mark read'), 'ic_mark_read_wht_24dp')}</header>`
      : ui.emailQuery !== undefined
        ? `<form class="lem-bar lem-searchbar" data-form="email-search">${act('email-list', T('Navigate up'), 'ic_arrow_back_wht_24dp')}<input name="query" value="${e(ui.emailQuery)}" placeholder="${e(T('Search hint'))}" aria-label="${e(T('Search hint'))}" autocomplete="off"></form>`
        : `<header class="lem-bar">${act('email-drawer', T('Open navigation drawer'), 'ic_menu_wht_24dp')}<h2>${e(name(folder))}</h2>${act('email-search', T('Search'), 'ic_menu_search')}${app === 'email' && folder === 'Trash' && rows.length ? overflow('trash') : ''}</header>`;
    const row = m => {
      const on = selected.includes(m.id), who = m.folder === 'Sent' || m.folder === 'Drafts' ? (m.to || m.from) : m.from;
      return `<div class="lem-row ${m.read ? 'read' : 'unread'}${on ? ' selected' : ''}"><button class="lem-photo" data-action="email-select" data-id="${e(m.id)}" role="checkbox" aria-checked="${on}" aria-label="${e(who)}">${on ? '<span class="lem-att-tile checked">✓</span>' : tile(who, m.folder === 'Sent' ? m.to : m.address)}</button><button class="lem-row-main" data-action="email-read" data-id="${e(m.id)}"><span class="lem-line1">${opts.marker ? opts.marker(m) : ''}<b class="lem-senders">${m.folder === 'Drafts' ? `<span class="lem-draft">${e(T('Drafts'))}</span>` : e(who)}</b>${m.attachment ? `<i class="lem-clip">${icon('ic_attach_file_wht_24dp')}</i>` : ''}<span class="lem-date">${e(window.KKEmail.shortDate(m, locale))}</span></span><span class="lem-subj">${e(m.subject || '')}</span><span class="lem-snippet">${e((m.body || '').replace(/\s+/g, ' '))}</span></button><button class="lem-star" data-action="email-star" data-id="${e(m.id)}" aria-label="${e(T(m.starred ? 'Remove star' : 'Add star'))}" aria-pressed="${m.starred}">${icon(m.starred ? 'ic_star_20dp' : 'ic_star_outline_20dp')}</button></div>`;
    };
    const plain = !selected.length && ui.emailQuery === undefined;
    const top = plain && opts.top ? opts.top(folder) : '';
    return `<div class="app-view lem lem-list" style="${style}">${head}<div class="email-scroll lem-scroll">${top}${rows.length ? rows.map(row).join('') : emptyView(app, folder, ui.emailQuery, T)}</div>${plain ? `<button class="lem-fab" data-action="email-compose" aria-label="${e(T('Compose'))}">${icon('ic_pencil_wht_24dp')}</button>` : ''}</div>`;
  }
  // The navigation drawer: account header, then the folders with their icons.
  function drawer(mail, ui, lang, opts) {
    const T = key => text(opts.app || 'email', lang, key);
    const theme = THEMES[opts.app || 'email'], account = opts.account || window.ICSEmail.account;
    const groups = opts.folders || [['', ['Inbox', 'Starred', 'Drafts', 'Outbox', 'Sent', 'Trash']]];
    const folder = ui.emailFolder || (opts.app === 'gmail' ? 'Primary' : 'Inbox');
    const listOf = opts.list || window.ICSEmail.list, name = opts.folderName || (f => T(f));
    const count = f => { const items = listOf(mail, f); return ['Drafts', 'Outbox', 'Spam', 'Trash', 'All mail', 'Starred'].includes(f) ? items.length : items.filter(m => !m.read).length; };
    const row = f => { const n = count(f); return `<button class="lem-folder${f === folder ? ' on' : ''}" data-action="email-folder" data-id="${e(f)}"><span class="lem-folder-icon" style="-webkit-mask-image:url(assets/gm5-ic_drawer_${FOLDER_ICONS[f] || 'label'}_24dp.png);mask-image:url(assets/gm5-ic_drawer_${FOLDER_ICONS[f] || 'label'}_24dp.png)"></span><span class="lem-folder-name">${e(name(f))}</span>${n ? `<em>${n}</em>` : ''}</button>`; };
    const initial = account.charAt(0).toLocaleUpperCase();
    return `<div class="lem-drawer-scrim" data-action="close-overlay"></div><nav class="lem-drawer" style="--lem:${theme.primary}" aria-label="${e(theme.name)}"><div class="lem-account"><span class="lem-account-avatar">${e(initial)}</span><b>${e(opts.accountName || 'Nexus 6')}</b><small>${e(account)}</small></div>${groups.map(([title, folders]) => `${title ? `<h4>${e(name(title))}</h4>` : ''}${folders.map(row).join('')}`).join('<hr>')}<hr><button class="lem-folder" data-action="email-settings"><span class="lem-folder-icon" style="-webkit-mask-image:url(assets/gm5-ic_drawer_settings_24dp.png);mask-image:url(assets/gm5-ic_drawer_settings_24dp.png)"></span><span class="lem-folder-name">${e(T('Settings'))}</span></button><button class="lem-folder" data-action="email-unavailable"><span class="lem-folder-icon" style="-webkit-mask-image:url(assets/gm5-ic_drawer_help_24dp.png);mask-image:url(assets/gm5-ic_drawer_help_24dp.png)"></span><span class="lem-folder-name">${e(T('Help & feedback'))}</span></button></nav>`;
  }
  function overlay(mail, ui, photos, t, lang, opts = {}) {
    const app = opts.app || 'email', T = key => text(app, lang, key, t);
    if (ui.overlay === 'email-drawer') return drawer(mail, ui, lang, opts);
    const menu = items => `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu">${items.map(([action, label, id]) => `<button role="menuitem" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''}>${e(T(label))}</button>`).join('')}</div>`;
    if (ui.overlay === 'email-menu') {
      const kind = ui.emailMenu || 'list', item = mail.find(m => m.id === ui.emailId);
      // compose_menu.xml (LMY48Y PrebuiltEmailGoogle): Attach file (a submenu: Attach file, Attach picture) and Send are
      // actions; Save draft, Discard, Settings and Help & feedback overflow. Cc / Bcc open from the chevron by To.
      if (kind === 'compose') return menu([['email-save', 'Save draft'], ['email-discard', 'Discard'], ['email-settings', 'Settings'], ['email-unavailable', 'Help & feedback']]);
      if (kind === 'attach') return menu([['email-attach-file', 'Attach file'], ['email-attach', 'Attach picture']]);
      /* conversation_actions.xml as ActionBarController.setConversationModeOptions leaves it for an Email account
         (EmailProvider.getCapabilities: no archive, labels, importance, mute, spam or "show original"): Delete and Mark
         unread on the toolbar, "Move to" (menu_move_to_state: never) in the overflow; Settings and Help stay hidden. */
      if (kind === 'conversation') return menu([['email-folders', 'Move to']]);
      /* MessageHeaderView's overflow (message_header_overflow_menu.xml): with the default reply behaviour Reply is the
         header button, so Reply all, Forward, Add or Remove star (not in Trash) and Print. */
      if (kind === 'message') return menu([['email-reply-all', 'Reply all'], ['email-forward', 'Forward'], ...(item && item.folder !== 'Trash' ? [['email-star', item.starred ? 'Remove star' : 'Add star', item.id]] : []), ['email-print', 'Print']]);
      // validateVolatileMenuOptionVisibility: "Empty Trash" over a non-empty trash (EMPTY_TRASH is an Email capability).
      if (kind === 'trash') return menu([['email-empty-trash', 'Empty Trash']]);
      return '';
    }
    /* SingleFolderSelectionDialog: an AlertDialog titled "Move to" over single_folders_view rows (48 sp; the 24 dp folder
       icon 24 dp in, the 16 sp #757575 name 16 dp after it) and Cancel / OK. Only folders that take moved mail are offered
       (EmailProvider.getFolderCapabilities: Inbox and Trash on this account), not the one the message is in; a row moves
       it at once. */
    if (ui.overlay === 'email-folders' && app === 'email') {
      const item = mail.find(m => m.id === ui.emailId), targets = ['Inbox', 'Trash'].filter(f => f !== item?.folder);
      return `<div class="ga-scrim" data-action="close-overlay"></div><div class="ga-dialog ga-alert lem-alert lem-move" role="dialog" aria-label="${e(T('Move to'))}"><h3 class="ga-title">${e(T('Move to'))}</h3><div class="lem-move-list">${targets.map(f => `<button type="button" data-action="email-move" data-id="${f}"><span class="lem-folder-icon" style="-webkit-mask-image:url(assets/gm5-ic_drawer_${FOLDER_ICONS[f]}_24dp.png);mask-image:url(assets/gm5-ic_drawer_${FOLDER_ICONS[f]}_24dp.png)"></span><span>${e(T(f))}</span></button>`).join('')}</div><div class="ga-buttons"><button type="button" data-action="close-overlay">${e(T('Cancel'))}</button><button type="button" data-action="close-overlay">${e(T('OK'))}</button></div></div>`;
    }
    /* EmptyFolderDialogFragment: "Empty Trash?" with the plural count, Cancel and Delete in the #4285F4 accent. */
    if (ui.overlay === 'email-empty-trash') {
      const n = window.ICSEmail.list(mail, 'Trash').length, message = AndroidStrings.format(T(AndroidStrings.quantity(n) === 'one' ? 'Will be deleted (one)' : 'Will be deleted'), n);
      return `<div class="ga-scrim" data-action="close-overlay"></div><div class="ga-dialog ga-alert lem-alert" role="alertdialog" aria-label="${e(T('Empty Trash?'))}"><h3 class="ga-title">${e(T('Empty Trash?'))}</h3><p class="ga-body">${e(message)}</p><div class="ga-buttons"><button type="button" data-action="close-overlay">${e(T('Cancel'))}</button><button type="button" data-action="email-empty-trash-ok">${e(T('Delete'))}</button></div></div>`;
    }
    return window.KKEmail.overlay(mail, ui, photos, t, lang, {});
  }
  window.LPEmail = {TILE_COLORS, THEMES, hash, tile, render, overlay};
})();
