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
    'Inbox': {res: 'EmailGoogle:mailbox_name_display_inbox', hu: 'Beérkezett üzenetek', de: 'Posteingang', fr: 'Boîte de réception', es: 'Recibidos'},
    'Outbox': {src: 'AOSP', hu: 'Kimenő levelek', de: 'Postausgang', fr: 'Boîte d’envoi', es: 'Por enviar'},
    'Drafts': {res: 'EmailGoogle:mailbox_name_display_drafts', hu: 'Piszkozatok', de: 'Entwürfe', fr: 'Brouillons', es: 'Borradores'},
    'Sent': {res: 'EmailGoogle:mailbox_name_display_sent', hu: 'Elküldve', de: 'Gesendet', fr: 'Éléments envoyés', es: 'Enviados'},
    'Trash': {res: 'EmailGoogle:mailbox_name_display_trash', hu: 'Kuka', de: 'Papierkorb', fr: 'Corbeille', es: 'Papelera'},
    'Starred': {res: 'EmailGoogle:mailbox_name_display_starred', hu: 'Csillagozott', de: 'Markiert', fr: 'Messages suivis', es: 'Destacados'},
    'Compose': {res: 'EmailGoogle:compose', hu: 'Levélírás', de: 'Schreiben', fr: 'Nouveau message', es: 'Redactar'},
    'Search': {res: 'EmailGoogle:menu_search', hu: 'Keresés', de: 'Suche', fr: 'Rechercher', es: 'Buscar'},
    'Refresh': {res: 'EmailGoogle:refresh', hu: 'Frissítés', de: 'Aktualisieren', fr: 'Actualiser', es: 'Actualizar'},
    'Sync options': {res: 'EmailGoogle:menu_folder_options', hu: 'Szinkronizálási beállítások', de: 'Synchronisierungsoptionen', fr: 'Options de synchronisation', es: 'Ajustes de sincronización'},
    'Settings': {res: 'EmailGoogle:menu_settings', hu: 'Beállítások', de: 'Einstellungen', fr: 'Paramètres', es: 'Ajustes'},
    'Help': {res: 'EmailGoogle:help_and_info', hu: 'Súgó', de: 'Hilfe', fr: 'Aide', es: 'Ayuda'},
    'Mark read': {res: 'EmailGoogle:mark_read', hu: 'Megjelölés olvasottként', de: 'Als gelesen markieren', fr: 'Marquer comme lu', es: 'Marcar como leída'},
    'Mark unread': {res: 'EmailGoogle:mark_unread', hu: 'Megjelölés olvasatlanként', de: 'Als ungelesen markieren', fr: 'Marquer comme non lu', es: 'Marcar como no leída'},
    'Delete': {res: 'EmailGoogle:delete', hu: 'Törlés', de: 'Löschen', fr: 'Supprimer', es: 'Eliminar'},
    'Add star': {res: 'EmailGoogle:add_star', hu: 'Csillagozás', de: 'Markieren', fr: 'Activer le suivi', es: 'Añadir estrella'},
    'Remove star': {res: 'EmailGoogle:remove_star', hu: 'Csillag eltávolítása', de: 'Markierung entfernen', fr: 'Désactiver le suivi', es: 'Eliminar estrella'},
    'Reply': {res: 'EmailGoogle:reply', hu: 'Válasz', de: 'Antworten', fr: 'Répondre', es: 'Responder'},
    'Reply all': {res: 'EmailGoogle:reply_all', hu: 'Válasz mind.', de: 'Allen antworten', fr: 'Répondre à tous', es: 'Responder a todos'},
    'Forward': {res: 'EmailGoogle:forward', hu: 'Továbbítás', de: 'Weiterleiten', fr: 'Transférer', es: 'Reenviar'},
    'Send': {res: 'EmailGoogle:send', hu: 'Küldés', de: 'Senden', fr: 'Envoyer', es: 'Enviar'},
    'Discard': {res: 'EmailGoogle:discard', hu: 'Elvetés', de: 'Löschen', fr: 'Supprimer', es: 'Descartar'},
    'Discard this message?': {res: 'EmailGoogle:confirm_discard_text', hu: 'Elveti ezt az üzenetet?', de: 'Nachricht löschen?', fr: 'Supprimer ce message ?', es: '¿Quieres descartar este mensaje?'},
    'Cancel': {res: 'EmailGoogle:cancel_attachment', hu: 'Mégse', de: 'Abbrechen', fr: 'Annuler', es: 'Cancelar'},
    'Attach video': {res: 'EmailGoogle:add_video_attachment', hu: 'Videó csatolása', de: 'Video anhängen', fr: 'Joindre une vidéo', es: 'Adjuntar vídeo'},
    'Send feedback': {res: 'EmailGoogle:feedback', hu: 'Visszajelzés küldése', de: 'Feedback geben', fr: 'Envoyer des commentaires', es: 'Danos tu opinión'},
    'Attach file': {res: 'EmailGoogle:add_file_attachment', hu: 'Fájl csatolása', de: 'Datei anhängen', fr: 'Joindre un fichier', es: 'Adjuntar archivo'},
    'Save draft': {res: 'EmailGoogle:save_draft', hu: 'Piszkozat mentése', de: 'Entwurf speichern', fr: 'Enregistrer le brouillon', es: 'Guardar borrador'},
    'To': {res: 'EmailGoogle:to', hu: 'Címzett', de: 'An', fr: 'À', es: 'Para'},
    'Cc': {res: 'EmailGoogle:cc', hu: 'Másolatot kap', de: 'Cc', fr: 'Cc', es: 'Cc'},
    'Bcc': {res: 'EmailGoogle:bcc', hu: 'Titkos másolat', de: 'Bcc', fr: 'Cci', es: 'Cco'},
    'Subject': {res: 'EmailGoogle:subject_hint', hu: 'Tárgy', de: 'Betreff', fr: 'Objet', es: 'Asunto'},
    'Compose email': {res: 'EmailGoogle:body_hint', hu: 'Levélírás', de: 'E-Mail schreiben', fr: 'Composez un message', es: 'Escribe tu correo'},
    'Add Cc/Bcc': {src: 'AOSP', hu: 'Másolatmezők', de: 'Cc/Bcc hinzufügen', fr: 'Ajouter Cc/Cci', es: 'Añadir Cc/Cco'},
    'Attach picture': {res: 'EmailGoogle:add_photo_attachment', hu: 'Kép csatolása', de: 'Bild anhängen', fr: 'Joindre une photo', es: 'Adjuntar imagen'},
    'Open navigation drawer': {res: 'EmailGoogle:drawer_open', hu: 'Navigációs fiók kinyitása', de: 'Navigationsleiste öffnen', fr: 'Ouvrir le panneau de navigation', es: 'Abrir control de navegación'},
    'Search email': {src: 'AOSP', hu: 'E-mail keresése', de: 'In E-Mails suchen', fr: 'Rechercher l’e-mail', es: 'Buscar correo'},
    'No messages.': {res: 'EmailGoogle:no_conversations', hu: 'Nincsenek üzenetek.', de: 'Keine Nachrichten', fr: 'Aucun message', es: 'No hay ningún mensaje.'},
    'me': {res: 'EmailGoogle:me_object_pronun', hu: 'nekem', de: 'ich', fr: 'moi', es: 'yo'},
    'To: ': {src: 'AOSP', hu: 'Címzett: ', de: 'An: ', fr: 'À : ', es: 'Para: '},
    'Message saved as draft.': {res: 'EmailGoogle:message_saved', hu: 'Az üzenet mentve piszkozatként.', de: 'Nachricht wurde als Entwurf gespeichert.', fr: 'Brouillon enregistré.', es: 'Mensaje guardado como borrador'},
    'Move to': {res: 'EmailGoogle:menu_move_to', hu: 'Áthelyezés ide:', de: 'Verschieben nach', fr: 'Déplacer vers', es: 'Mover a'},
    'Touch a sender image to select that conversation.': {res: 'EmailGoogle:conversation_photo_welcome_text', hu: 'A beszélgetés kiválasztásához érintse meg a küldő képét.', de: 'Auf Absenderbild tippen, um die entsprechende Konversation auszuwählen', fr: 'Appuyez sur l\'image d\'un expéditeur pour sélectionner la conversation.', es: 'Toca la imagen de un remitente para seleccionar esa conversación.'},
    'Dismiss tip': {res: 'EmailGoogle:dismiss_tip_hover_text', hu: 'Tipp elvetése', de: 'Tipp schließen', fr: 'Masquer le conseil', es: 'Ignorar sugerencia'},
    'Archive': {res: 'EmailGoogle:archive', hu: 'Archiválás', de: 'Archivieren', fr: 'Archiver', es: 'Archivar'}
  };
  // The text of the app on show: Gmail's own (StockStrings.gmailui) in Gmail, else Email's row.
  const STR = AndroidStrings.table('', S), tr = (lang, key, app) => { const row = app === 'gmail' && window.StockStrings?.gmailui?.[key]; return row ? AndroidStrings.pick(row, lang, key) : STR.t(key, lang); };
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
      return `<form class="app-view kem kem-compose email-compose" data-form="email">${bar(upHome(), T('Compose'), '', `<button type="submit" class="kem-act" aria-label="${e(T('Send'))}">${ICON('ic_menu_send_holo_light')}</button>${overflow('compose')}`)}<div class="email-scroll kem-scroll"><div class="kem-from">${e(item.from === window.ICSEmail.account ? account : item.address || account)}</div>${field('to', 'To')}${cc ? field('cc', 'Cc') + field('bcc', 'Bcc') : ''}${field('subject', 'Subject')}<label class="kem-body"><textarea name="body" placeholder="${e(T('Compose email'))}" aria-label="${e(T('Compose email'))}" maxlength="10000">${e(item.body)}</textarea></label>${item.attachment ? `<div class="kem-attachment">${item.attachment.vcard ? `<img class="kem-att-file" src="assets/kem-ic_attachment_holo_light.png" alt="">` : window.ICSMedia.art(item.attachment)}<span>${e(item.attachment.name)}</span><button type="button" data-action="email-remove-attachment" aria-label="${e(T('Discard'))}">×</button></div>` : ''}${ui.emailError ? `<p class="kem-error">${e(t(ui.emailError))}</p>` : ''}</div></form>`;
    }
    if (ui.sub === 'read' && item) {
      const trashLike = item.folder === 'Trash';
      const actions = (opts.archive && item.folder === 'Inbox' ? act('email-archive', T('Archive'), 'ic_menu_archive_holo_light') : '') + (trashLike ? act('email-restore', T('Move to'), 'ic_menu_move_to_holo_light') : act('email-trash', T('Delete'), 'ic_menu_trash_holo_light')) + act('email-unread', T('Mark unread'), 'ic_menu_mark_unread_holo_light') + overflow('conversation');
      const sent = item.folder === 'Sent' || item.folder === 'Drafts';
      const to = sent ? item.to || '' : T('me');
      return `<div class="app-view kem kem-conversation">${bar(upHome(), opts.archive ? '' : name(folder), '', actions)}<div class="email-scroll kem-scroll"><div class="kem-subject"><h2>${e(item.subject || '')}</h2>${opts.chip ? opts.chip(item) : ''}<button class="kem-conv-star" data-action="email-star" data-id="${e(item.id)}" aria-label="${e(T(item.starred ? 'Remove star' : 'Add star'))}" aria-pressed="${item.starred}">${ICON(item.starred ? 'ic_star_on_convo_view_holo_light' : 'ic_star_off_convo_view_holo_light')}</button></div><article class="kem-message"><div class="kem-msg-head">${tile(item.from, item.address)}<span class="kem-msg-who"><b>${e(item.from)}</b><small>${e(T('To: ').trimEnd())} ${e(to)}</small></span><span class="kem-msg-date">${e(shortDate(item, locale))}</span><button class="kem-msg-act" data-action="email-reply" aria-label="${e(T('Reply'))}">${ICON('ic_reply_holo_light')}</button><button class="kem-msg-act" data-action="email-menu" data-id="message" aria-label="More options">${ICON('ic_menu_moreoverflow_normal_holo_light')}</button></div><div class="kem-msg-body">${e(item.body).replace(/\n/g, '<br>')}</div>${item.attachment ? `<div class="kem-attachment">${item.attachment.vcard ? `<img class="kem-att-file" src="assets/kem-ic_attachment_holo_light.png" alt="">` : window.ICSMedia.art(item.attachment)}<span>${e(item.attachment.name)}</span></div>` : ''}</article></div></div>`;
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
      // compose_menu.xml (KTU84P EmailGoogle): Send is the action; Attach picture, Attach video, Add Cc/Bcc, Save draft,
      // Discard, Settings, Send feedback and Help overflow.
      if (kind === 'compose') return menu([['email-attach', 'Attach picture'], ['email-unavailable', 'Attach video'], ['email-cc', 'Add Cc/Bcc'], ['email-save', 'Save draft'], ['email-discard', 'Discard'], ['email-settings', 'Settings'], ['email-unavailable', 'Send feedback'], ['email-unavailable', 'Help']]);
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
