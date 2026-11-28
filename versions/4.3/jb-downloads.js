/* Downloads (packages/providers/DownloadProvider/ui, DownloadProviderUi.apk of the Galaxy Nexus IMM76I and Nexus 4 JWR66Y
   images): DownloadList on Theme.Holo.DialogWhenLarge (full screen on a phone).
   - The action bar titled "Downloads - Sorted by date" / "... by size" (download_title_sorted_by_*).
   - download_list.xml: the date-ordered ExpandableListView grouped by android.webkit.DateSorter (Today, Yesterday, Last 7
     days, Last month, Older; the first group open) or the size-ordered ListView, "No downloads.", and the bottom button
     bar with Sort by size / Sort by date.
   - download_list_item.xml rows: the check box, the 48 dp icon of the app that opens the file, the bold title, the
     domain, the status (Complete, Failed, In progress, Queued), the size and the date or time.
   - Checking rows starts the action mode: "Selected 1 out of 5" with Share and Delete (download_menu.xml).
   - A failed download offers Retry / Delete, a queued one Keep / Remove (DownloadList.handleItemClick).
   Texts are the APK's and the framework's of each image (docs/tools/apk-strings.py). The downloads are made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = {
    "Downloads": {"res": "DownloadProviderUi:app_label", "hu": "Letöltések", "de": "Downloads", "fr": "Téléchargements", "es": "Descargas"},
    "Downloads - Sorted by date": {"res": "DownloadProviderUi:download_title_sorted_by_date", "hu": "Letöltések - Dátum szerint rendezve", "de": "Downloads - Nach Datum sortiert", "fr": "Téléchargements : triés par date", "es": "Descargas (por fecha)"},
    "Downloads - Sorted by size": {"res": "DownloadProviderUi:download_title_sorted_by_size", "hu": "Letöltések - Méret szerint rendezve", "de": "Downloads - Nach Größe sortiert", "fr": "Téléchargements : triés par taille", "es": "Descargas (por tamaño)"},
    "Sort by date": {"res": "DownloadProviderUi:button_sort_by_date", "hu": "Rendezés dátum szerint", "de": "Nach Datum sortieren", "fr": "Trier par date", "es": "Ordenar por fecha"},
    "Sort by size": {"res": "DownloadProviderUi:button_sort_by_size", "hu": "Rendezés méret szerint", "de": "Nach Größe sortieren", "fr": "Trier par taille", "es": "Ordenar por tamaño"},
    "No downloads.": {"res": "DownloadProviderUi:no_downloads", "hu": "Nincsenek letöltések", "de": "Keine Downloads", "fr": "Aucun téléchargement", "es": "No hay descargas."},
    "Complete": {"res": "DownloadProviderUi:download_success", "hu": "Kész", "de": "Fertig", "fr": "Terminé", "es": "Correcta"},
    "Failed": {"res": "DownloadProviderUi:download_error", "hu": "Sikertelen", "de": "Fehler", "fr": "Échec", "es": "Incorrecta", "en": "Unsuccessful"},
    "In progress": {"res": "DownloadProviderUi:download_running", "hu": "Folyamatban", "de": "Läuft", "fr": "En cours…", "es": "En curso"},
    "Queued": {"res": "DownloadProviderUi:download_queued", "hu": "Várólistán", "de": "Eingereiht", "fr": "Ajouté à la file d'attente", "es": "En cola"},
    "Delete": {"res": "DownloadProviderUi:delete_download", "hu": "Törlés", "de": "Löschen", "fr": "Supprimer", "es": "Eliminar"},
    "Remove": {"res": "DownloadProviderUi:remove_download", "hu": "Törlés", "de": "Entfernen", "fr": "Supprimer", "es": "Quitar"},
    "Cancel": {"res": "DownloadProviderUi:cancel_running_download", "hu": "Mégse", "de": "Abbrechen", "fr": "Annuler", "es": "Cancelar"},
    "Keep": {"res": "DownloadProviderUi:keep_queued_download", "hu": "Megőrzés", "de": "Beibehalten", "fr": "Conserver", "es": "Conservar"},
    "Retry": {"res": "DownloadProviderUi:retry_download", "hu": "Újra", "de": "Wiederholen", "fr": "Réessayer", "es": "Reintentar"},
    "Selected %1$d out of %2$d": {"res": "DownloadProviderUi:selected_count", "hu": "%2$d/%1$d kiválasztva", "de": "%1$d von %2$d ausgewählt", "fr": "%1$d téléchargements sélectionnés sur %2$d", "es": "Elegido: %1$d de %2$d"},
    "Download Failed": {"res": "DownloadProviderUi:dialog_title_not_available", "hu": "Nem lehetett letölteni", "de": "Downloadfehler", "fr": "Téléchargement impossible", "es": "Error al descargar", "en": "Couldn't download"},
    "Do you want to retry downloading the file later or delete it from the queue?": {"res": "DownloadProviderUi:dialog_failed_body", "hu": "Később újra megpróbálja letölteni a fájlt vagy törli a várólistáról?", "de": "Möchten Sie später einen erneuten Downloadversuch für die Datei starten oder die Datei aus der Warteschlange löschen?", "fr": "Souhaitez-vous réessayer de télécharger le fichier ultérieurement ou préférez-vous le supprimer de la file d'attente ?", "es": "¿Quieres volver a intentar descargar el archivo más tarde o prefieres eliminarlo de la cola?"},
    "File not yet available": {"res": "DownloadProviderUi:dialog_title_queued_body", "hu": "A fájl sorban áll", "de": "Warten auf Download", "fr": "Fichier en attente", "es": "Archivo en cola", "en": "File in queue"},
    "This file is queued for future download.": {"res": "DownloadProviderUi:dialog_queued_body", "hu": "Ez a fájl sorban áll későbbi letöltésre, így még nem áll rendelkezésre.", "de": "Die Datei ist noch nicht verfügbar, da auf den Download der Datei gewartet wird.", "fr": "Ce fichier est en attente de téléchargement, et n'est donc pas encore disponible.", "es": "Este archivo está en cola para descargarlo próximamente, por lo que aún no está disponible.", "en": "This file is queued for future download so isn't available yet."},
    "Share via": {"res": "DownloadProviderUi:download_share_dialog", "hu": "Megosztás:", "de": "Teilen über", "fr": "Partager via", "es": "Compartir a través de"},
    "Cannot open file": {"res": "DownloadProviderUi:download_no_application_title", "hu": "A fájlt nem lehet megnyitni", "de": "Datei kann nicht geöffnet werden.", "fr": "Impossible d'ouvrir le fichier", "es": "Error al abrir el archivo", "en": "Can't open file"},
    "<Unknown>": {"res": "DownloadProviderUi:missing_title", "hu": "<Ismeretlen>", "de": "<Unbekannt>", "fr": "<Inconnu>", "es": "<Desconocido>"},
    "Last month": {"res": "framework:last_month", "hu": "Múlt hónapban", "de": "Letzter Monat", "fr": "Le mois dernier", "es": "El mes pasado"},
    "Older": {"res": "framework:older", "hu": "Régebbi", "de": "Älter", "fr": "Préc.", "es": "Anterior"},
    "Last %d days": {"res": "framework:@plurals/last_num_days:other", "hu": "Elmúlt %d napban", "de": "Letzte %d Tage", "fr": "Les %d derniers jours", "es": "Últimos %d días"},
    "Share": {"res": "framework:share", "hu": "Megosztás", "de": "Teilen", "fr": "Partager", "es": "Compartir"},
    "Done": {"res": "framework:action_mode_done", "hu": "Kész", "de": "Fertig", "fr": "OK", "es": "Listo"}
  };
  // From 4.1 DateSorter takes "Today" and "Yesterday" from libcore's LocaleData (ICU) rather than the framework.
  const ICU = {Today: {res: 'ICU:today', hu: 'ma', de: 'Heute', fr: 'aujourd’hui', es: 'hoy'}, Yesterday: {res: 'ICU:yesterday', hu: 'tegnap', de: 'Gestern', fr: 'hier', es: 'ayer'}};
  const STR = AndroidStrings.table('', {...ICU, ...STRINGS}), T = (lang, key) => STR.t(key, lang);
  // The file type decides the icon (the app that opens it) and what a tap does.
  const KINDS = {image: 'gallery', audio: 'music', video: 'gallery', web: 'browser'};
  const DAY = 864e5;
  function seed(now) {
    return [
      {id: 1, title: 'beach-panorama.jpg', domain: 'picasaweb.google.com', size: 1384448, status: 'success', kind: 'image', time: now - 40 * 6e4},
      {id: 2, title: 'nexus-user-guide.pdf', domain: 'www.google.com', size: 3227648, status: 'success', kind: 'other', time: now - 5 * 36e5},
      {id: 3, title: 'morning-run-mix.mp3', domain: 'music.example', size: 6815744, status: 'failed', kind: 'audio', time: now - DAY - 3 * 36e5},
      {id: 4, title: 'holo-design-guide.html', domain: 'developer.android.com', size: 24576, status: 'success', kind: 'web', time: now - 3 * DAY},
      {id: 5, title: 'boarding-pass.pdf', domain: 'airline.example', size: 196608, status: 'queued', kind: 'other', time: now - 9 * DAY},
      {id: 6, title: 'family-dinner.jpg', domain: 'mail.google.com', size: 921600, status: 'success', kind: 'image', time: now - 40 * DAY}
    ];
  }
  // android.webkit.DateSorter: today, yesterday, the last 7 days, the last month, older.
  function bins(now) {
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const month = new Date(today); month.setMonth(month.getMonth() - 1);
    return [today.getTime(), today.getTime() - DAY, today.getTime() - 6 * DAY, month.getTime()];
  }
  const binOf = (time, edges) => { const i = edges.findIndex(edge => time >= edge); return i < 0 ? 4 : i; };
  const binLabel = (lang, i) => [T(lang, 'Today'), T(lang, 'Yesterday'), AndroidStrings.format(T(lang, 'Last %d days'), 7), T(lang, 'Last month'), T(lang, 'Older')][i];
  // Formatter.formatFileSize (4.x): "845 KB", "2.13 MB".
  function size(bytes, locale) {
    let value = bytes, unit = 'B';
    for (const next of ['KB', 'MB', 'GB']) { if (value <= 900) break; value /= 1024; unit = next; }
    const digits = value < 100 ? 2 : 0;
    return `${value.toLocaleString(locale, {minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false})} ${unit}`;
  }
  const STATUS = {success: 'Complete', failed: 'Failed', running: 'In progress', queued: 'Queued'};
  function when(time, ctx) {
    const today = new Date(ctx.now); today.setHours(0, 0, 0, 0);
    return time < today.getTime() ? new Date(time).toLocaleDateString(ctx.locale, {year: 'numeric', month: 'numeric', day: 'numeric'})
      : new Date(time).toLocaleTimeString(ctx.locale, {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24});
  }
  const state = ctx => (ctx.ui.hdl ||= {selected: [], bySize: false, expanded: null});
  const list = ctx => (ctx.data.downloads ||= seed(ctx.now));
  function item(d, ctx) {
    const on = state(ctx).selected.includes(d.id), app = KINDS[d.kind];
    return `<div class="hdl-item${on ? ' on' : ''}" role="button" tabindex="0" data-action="hdl-open" data-id="${d.id}"><button type="button" class="hdl-check" data-action="hdl-select" data-id="${d.id}" role="checkbox" aria-checked="${on}" aria-label="${e(d.title)}"><img src="assets/dl-btn_check_${on ? 'on' : 'off'}_holo_dark.png" alt=""></button><img class="hdl-icon" src="assets/${app ? `${app}.png` : 'dl-ic_download_misc_file_type.png'}" alt=""><span class="hdl-text"><b>${e(d.title || T(ctx.lang, '<Unknown>'))}</b><small>${e(d.domain)}</small><span class="hdl-line"><small>${e(T(ctx.lang, STATUS[d.status]))}</small><small class="hdl-size">${e(size(d.size, ctx.locale))}</small><small class="hdl-date">${e(when(d.time, ctx))}</small></span></span></div>`;
  }
  function render(ctx) {
    const {lang} = ctx, s = state(ctx), items = list(ctx);
    let body;
    if (!items.length) body = `<p class="hdl-empty">${e(T(lang, 'No downloads.'))}</p>`;
    else if (s.bySize) body = [...items].sort((a, b) => b.size - a.size).map(d => item(d, ctx)).join('');
    else {
      const edges = bins(ctx.now), groups = [0, 1, 2, 3, 4].map(bin => ({bin, items: items.filter(d => binOf(d.time, edges) === bin).sort((a, b) => b.time - a.time)})).filter(g => g.items.length);
      // DownloadList expands the first group.
      body = groups.map((g, i) => { const open = s.expanded ? s.expanded.includes(g.bin) : i === 0; return `<button type="button" class="hdl-group" data-action="hdl-group" data-id="${g.bin}" aria-expanded="${open}"><img src="assets/dl-expander_${open ? 'open' : 'close'}_holo_dark.png" alt=""><span>${e(binLabel(lang, g.bin))}</span></button>${open ? g.items.map(d => item(d, ctx)).join('') : ''}`; }).join('');
    }
    const n = s.selected.length;
    const bar = n
      ? `<header class="hdl-cab"><button data-action="hdl-deselect" aria-label="${e(T(lang, 'Done'))}"><img src="assets/dl-ic_cab_done_holo_dark.png" alt=""></button><i></i><h2>${e(AndroidStrings.format(T(lang, 'Selected %1$d out of %2$d'), n, items.length))}</h2><button data-action="hdl-share" aria-label="${e(T(lang, 'Share'))}"><img src="assets/dl-ic_menu_share.png" alt=""></button><button data-action="hdl-delete" aria-label="${e(T(lang, 'Delete'))}"><img src="assets/dl-ic_menu_delete.png" alt=""></button></header>`
      : `<header class="hdl-ab"><button data-action="home" aria-label="${e(T(lang, 'Downloads'))}"><img src="assets/downloads.png" alt=""></button><h2>${e(T(lang, s.bySize ? 'Downloads - Sorted by size' : 'Downloads - Sorted by date'))}</h2></header>`;
    return `<div class="app-view hdl" data-no-translate>${bar}<div class="hdl-list">${body}</div>${items.length ? `<div class="hdl-sortbar"><button data-action="hdl-sort">${e(T(lang, s.bySize ? 'Sort by date' : 'Sort by size'))}</button></div>` : ''}</div>`;
  }
  // The failed / queued download dialogs and the "Share via" chooser.
  function overlay(ctx) {
    const {ui, lang} = ctx, [kind, id] = (ui.overlay || '').split(':'), d = list(ctx).find(x => x.id === Number(id));
    const dialog = (title, message, buttons) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog hdl-dialog" role="dialog"><h3>${e(title)}</h3><p>${e(message)}</p><div class="settings-dialog-actions">${buttons.map(([action, label]) => `<button data-action="${action}" data-id="${id || ''}">${e(label)}</button>`).join('')}</div></div>`;
    if (kind === 'hdl-failed' && d) return dialog(T(lang, 'Download Failed'), T(lang, 'Do you want to retry downloading the file later or delete it from the queue?'), [['hdl-remove', T(lang, 'Delete')], ['hdl-retry', T(lang, 'Retry')]]);
    if (kind === 'hdl-queued' && d) return dialog(T(lang, 'File not yet available'), T(lang, 'This file is queued for future download.'), [['hdl-remove', T(lang, 'Remove')], ['close-overlay', T(lang, 'Keep')]]);
    if (kind === 'hdl-share') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog hdl-dialog" role="dialog"><h3>${e(T(lang, 'Share via'))}</h3>${[['gmail', 'Gmail'], ['messaging', 'Messaging']].map(([app, name]) => `<button class="settings-row" data-action="hdl-share-to" data-id="${app}"><span class="row-icon"><img src="assets/${app}.png" alt=""></span><span class="row-copy">${e(ctx.t(name))}</span></button>`).join('')}</div>`;
    return null;
  }
  function handle(action, id, ctx) {
    const {ui, data, lang} = ctx, s = state(ctx), close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'hdl-open': {
        const d = list(ctx).find(x => x.id === Number(id)); if (!d) break;
        if (s.selected.length) { handle('hdl-select', id, ctx); break; }
        if (d.status === 'failed') { ui.overlay = `hdl-failed:${d.id}`; ctx.renderOverlay(); break; }
        if (d.status === 'queued') { ui.overlay = `hdl-queued:${d.id}`; ctx.renderOverlay(); break; }
        if (d.status === 'running') break;
        if (KINDS[d.kind]) ctx.openApp(KINDS[d.kind]); else ctx.toast(T(lang, 'Cannot open file'));
        break;
      }
      case 'hdl-select': { const n = Number(id); s.selected = s.selected.includes(n) ? s.selected.filter(x => x !== n) : [...s.selected, n]; ctx.render(); break; }
      case 'hdl-deselect': s.selected = []; ctx.render(); break;
      case 'hdl-delete': data.downloads = list(ctx).filter(d => !s.selected.includes(d.id)); s.selected = []; ctx.save(); ctx.render(); break;
      case 'hdl-share': ui.overlay = 'hdl-share'; ctx.renderOverlay(); break;
      case 'hdl-share-to': close(); s.selected = []; ctx.openApp(id); break;
      case 'hdl-group': {
        const edges = bins(ctx.now), present = [...new Set(list(ctx).map(d => binOf(d.time, edges)))].sort(), open = s.expanded || present.slice(0, 1), bin = Number(id);
        s.expanded = open.includes(bin) ? open.filter(x => x !== bin) : [...open, bin]; ctx.render(); break;
      }
      case 'hdl-sort': s.bySize = !s.bySize; ctx.render(); break;
      case 'hdl-remove': data.downloads = list(ctx).filter(d => d.id !== Number(id)); s.selected = s.selected.filter(x => x !== Number(id)); close(); ctx.save(); ctx.render(); break;
      case 'hdl-retry': {
        const d = list(ctx).find(x => x.id === Number(id)); close();
        if (d) { d.status = 'running'; d.time = Date.now(); ctx.save(); setTimeout(() => { d.status = 'success'; ctx.save(); if (ui.view === 'downloads') ctx.render(); }, 3000); }
        ctx.render(); break;
      }
      default: return false;
    }
    return true;
  }
  function back(ctx) {
    const {ui} = ctx, s = state(ctx);
    if (ui.overlay) { ui.overlay = ''; ctx.renderOverlay(); return true; }
    if (s.selected.length) { s.selected = []; ctx.render(); return true; }
    return false;
  }
  window.HoloDownloads = {seed, bins, binOf, size, render, overlay, handle, back, T};
})();
/* The Downloads app on Android 4.3 (DownloadProviderUi of JWR66Y), moved out of simulator.js
   (docs/plans/engine-migration.md): its screen, actions, dialogs and Back go to HoloDownloads above with this context. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, data, deviceDate, i18n, openApp, overlayRoot, render, renderOverlay, save, toast, ui;
  const $bind = c => { $c = c; ({data, deviceDate, i18n, openApp, overlayRoot, render, renderOverlay, save, toast, ui} = c); };
  // Downloads: data.downloads (seeded on first use); the sort order and the selection live in ui.hdl.
  function dlContext() {
    return {data, ui, lang: i18n.language, locale: i18n.locale(), now: deviceDate().getTime(), hour24: !!data.settings.hour24, t: key => i18n.t(key),
      save, render, renderOverlay, toast, openApp};
  }
  const spec = {
    render(c) {
      $bind(c);
      switch (ui.view) {
        case 'downloads': return HoloDownloads.render(dlContext());
      }
    },
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      if (ui.view === 'downloads' && action.startsWith('hdl-') && HoloDownloads.handle(action, id, dlContext())) return true;
      return false;
    },
    back(c) {
      $bind(c);
      if (ui.view === 'downloads' && HoloDownloads.back(dlContext())) return true;
      return false;
    },
    // Overlays drawn before the core's own, which end renderOverlay there.
    overlayEarly(c) {
      $bind(c);
      if (ui.view === 'downloads' && ui.overlay.startsWith('hdl-')) { overlayRoot.innerHTML = HoloDownloads.overlay(dlContext()) || ''; return true; }
      return false;
    }
  };
  JB.register('downloads', spec);
})();
