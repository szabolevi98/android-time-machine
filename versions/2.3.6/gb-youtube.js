/* YouTube 2.1.6 of the Nexus S image (YouTube.apk), the dark 2011 app, from its layouts, dimensions and texts:
   - header.xml: the 51 dip header (header.9 with the logo, then the search and upload buttons);
   - home_activity.xml / results_activity.xml: video_item.xml rows (the 80 x 60 dip thumbnail in video_frame with the
     duration on black, the 13 dp bold white title, the 12 dp grey author and "%1$,d views");
   - the Browse categories (category_item.xml, 18 dp) and a category's videos with the time filter;
   - watch_activity.xml: the player (the paused overlay, the scrubber and the time), the Info / Related videos / Comments
     tab row (tab_drawable, 16 dp) over watch_video_info.xml (18 dp bold title, date and views, likes and dislikes,
     Description, Category, Tags) and the like / dislike / favorite / share toolbar;
   - the Menu-key menu (Home, Browse, My Channel, Upload, Search, Settings).
   YouTube 2.1.6 has no Hungarian, so it stays English there, as on the phone. The videos are made up and play offline. */
(() => {
  'use strict';
  const {e} = GBApps;
  const STRINGS = {
    "YouTube": {"res": "YouTube:application_name", "hu": "YouTube", "de": "YouTube", "fr": "YouTube", "es": "YouTube"},
    "Home": {"res": "YouTube:menu_home", "hu": "Home", "de": "Startseite", "fr": "Accueil", "es": "Inicio"},
    "Browse": {"res": "YouTube:menu_browse", "hu": "Browse", "de": "Durchsuchen", "fr": "Parcourir", "es": "Explorar"},
    "My Channel": {"res": "YouTube:menu_my_channel", "hu": "My Channel", "de": "Mein Kanal", "fr": "Ma chaîne", "es": "Mi canal"},
    "Upload": {"res": "YouTube:menu_upload", "hu": "Upload", "de": "Hochladen", "fr": "Ajouter", "es": "Subir"},
    "Search": {"res": "YouTube:menu_search", "hu": "Search", "de": "Suche", "fr": "Rechercher", "es": "Buscar"},
    "Settings": {"res": "YouTube:menu_settings", "hu": "Settings", "de": "Einstellungen", "fr": "Paramètres", "es": "Ajustes"},
    "Search YouTube": {"res": "YouTube:search_hint", "hu": "Search YouTube", "de": "YouTube durchsuchen", "fr": "Rechercher sur YouTube", "es": "Buscar en YouTube"},
    "Info": {"res": "YouTube:video_info", "hu": "Info", "de": "Info", "fr": "Infos", "es": "Información"},
    "Related videos": {"res": "YouTube:video_info_related_label_text", "hu": "Related videos", "de": "Ähnliche Videos", "fr": "Vidéos associées", "es": "Vídeos relacionados"},
    "Comments": {"res": "YouTube:comments", "hu": "Comments", "de": "Kommentare", "fr": "Commentaires", "es": "Comentarios"},
    "Description": {"res": "YouTube:description_label_text", "hu": "Description", "de": "Beschreibung", "fr": "Description", "es": "Descripción"},
    "Category": {"res": "YouTube:category_label_text", "hu": "Category", "de": "Kategorie", "fr": "Catégorie", "es": "Categoría"},
    "Tags": {"res": "YouTube:tags_label_text", "hu": "Tags", "de": "Tags", "fr": "Tags", "es": "Etiquetas"},
    "%1$,d views": {"res": "YouTube:views", "hu": "%1$,d views", "de": "%1$,d views", "fr": "%1$,d views", "es": "%1$,d views"},
    "by %1$s": {"res": "YouTube:video_author", "hu": "by %1$s", "de": "von %1$s", "fr": "de %1$s", "es": "de %1$s"},
    "%1$d likes, %2$d dislikes": {"res": "YouTube:num_likes_and_dislikes", "hu": "%1$d likes, %2$d dislikes", "de": "%1$d positive Bewertungen, %2$d negative Bewertungen", "fr": "%1$d aiment, %2$d n'aiment pas", "es": "Me gustan %1$d, no me gustan %2$d"},
    "Favorite": {"res": "YouTube:add_favorite", "hu": "Favorite", "de": "Favorit", "fr": "Favori", "es": "Favoritos"},
    "Unfavorite": {"res": "YouTube:remove_favorite", "hu": "Unfavorite", "de": "Aus Favoriten entfernen", "fr": "Supprimer des favoris", "es": "Eliminar de Favoritos"},
    "Share": {"res": "YouTube:share", "hu": "Share", "de": "Weitergeben", "fr": "Partager", "es": "Compartir"},
    "Flag": {"res": "YouTube:flag", "hu": "Flag", "de": "Melden", "fr": "Signaler", "es": "Marcar"},
    "You like this video": {"res": "YouTube:rating_like", "hu": "You like this video", "de": "Ihnen gefällt dieses Video.", "fr": "Vous aimez cette vidéo.", "es": "Te gusta este vídeo."},
    "You dislike this video": {"res": "YouTube:rating_dislike", "hu": "You dislike this video", "de": "Ihnen gefällt das Video nicht", "fr": "Vous n'aimez pas cette vidéo.", "es": "No te gusta este vídeo."},
    "Video added to favorites": {"res": "YouTube:added_to_favorites", "hu": "Video added to favorites", "de": "Video zu Favoriten hinzugefügt", "fr": "Vidéo ajoutée aux favoris", "es": "Vídeo añadido a Favoritos"},
    "Video removed from favorites": {"res": "YouTube:removed_from_favorites", "hu": "Video removed from favorites", "de": "Video aus Favoriten entfernt", "fr": "Vidéo supprimée des favoris", "es": "Vídeo eliminado de Favoritos"},
    "Results for \"%1$s\"": {"res": "YouTube:videos_matching", "hu": "Results for \"%1$s\"", "de": "Ergebnisse für \"%1$s\"", "fr": "Résultats pour \"%1$s\"", "es": "Resultados de \"%1$s\""},
    "No videos found": {"res": "YouTube:no_videos_found", "hu": "No videos found", "de": "Keine Videos gefunden", "fr": "Aucune vidéo n'a été trouvée.", "es": "No se ha encontrado ningún vídeo."},
    "All": {"res": "YouTube:all_categories", "hu": "All", "de": "All", "fr": "All", "es": "All"},
    "Most viewed": {"res": "YouTube:most_viewed_videos", "hu": "Most viewed", "de": "Meistgesehen", "fr": "Les plus regardées", "es": "Más vistos"},
    "Top rated": {"res": "YouTube:top_rated_videos", "hu": "Top rated", "de": "Beste Bewertung", "fr": "Les mieux notées", "es": "Más valorados"},
    "Time filter": {"res": "YouTube:time_filter_dialog_title", "hu": "Time filter", "de": "Zeitfilter", "fr": "Filtrer par période", "es": "Filtro de tiempo"},
    "Today": {"res": "YouTube:time_filter_today", "hu": "Today", "de": "Heute", "fr": "Aujourd'hui", "es": "Hoy"},
    "This week": {"res": "YouTube:time_filter_this_week", "hu": "This week", "de": "Diese Woche", "fr": "Cette semaine", "es": "Esta semana"},
    "This month": {"res": "YouTube:time_filter_this_month", "hu": "This month", "de": "Diesen Monat", "fr": "Ce mois-ci", "es": "Este mes"},
    "All time": {"res": "YouTube:time_filter_all_time", "hu": "All time", "de": "Gesamte Zeit", "fr": "Toutes périodes", "es": "Siempre"},
    "Respond to this video...": {"res": "YouTube:comment_hint", "hu": "Respond to this video...", "de": "Auf dieses Video antworten...", "fr": "Laisser un commentaire vidéo sur cette vidéo...", "es": "Responder a este vídeo..."},
    "Post": {"res": "YouTube:comment_post_button", "hu": "Post", "de": "Post", "fr": "Post", "es": "Post"},
    "Comment posted": {"res": "YouTube:comment_posted", "hu": "Comment posted", "de": "Comment posted", "fr": "Comment posted", "es": "Comment posted"},
    "Rotate or double tap the video to toggle fullscreen": {"res": "YouTube:promo_fullscreen", "hu": "Rotate or double tap the video to toggle fullscreen", "de": "Für Vollbildanzeige drehen oder zweimal auf das Video tippen", "fr": "Faites pivoter la vidéo ou appuyez deux fois dessus pour activer le mode plein écran.", "es": "Gira el vídeo o tócalo dos veces para cambiar a pantalla completa."},
    "%1$s days ago": {"res": "YouTube:ago_day_plural", "hu": "%1$s days ago", "de": "Vor %1$s Tagen", "fr": "il y a %1$s jours", "es": "Hace %1$s días"},
    "%1$s weeks ago": {"res": "YouTube:ago_week_plural", "hu": "%1$s weeks ago", "de": "vor %1$s Wochen", "fr": "il y a %1$s semaines", "es": "hace %1$s semanas"},
    "%1$s months ago": {"res": "YouTube:ago_month_plural", "hu": "%1$s months ago", "de": "vor %1$s Monaten", "fr": "il y a %1$s mois", "es": "hace %1$s meses"},
    "Subscribe": {"res": "YouTube:subscribe", "hu": "Subscribe", "de": "Abonnieren", "fr": "S'inscrire", "es": "Suscribirse"},
    "Share this video via": {"res": "YouTube:send_video", "hu": "Share this video via", "de": "Video weiterleiten über", "fr": "Partager cette vidéo via...", "es": "Compartir vídeo a través de"},
    "Sign in": {"res": "YouTube:accounts_title", "hu": "Sign in", "de": "Anmelden", "fr": "Connexion", "es": "Acceder"},
    "General settings": {"res": "YouTube:pref_general_category", "hu": "General settings", "de": "Allgemeine Einstellungen", "fr": "Paramètres généraux", "es": "Ajustes generales"},
    "High quality on mobile": {"res": "YouTube:pref_default_hq_title", "hu": "High quality on mobile", "de": "Mit hoher Qualität auf Handys", "fr": "Vidéo haute qualité sur mobile", "es": "Alta calidad en móvil"},
    "Start videos in high quality when connected to a mobile network.": {"res": "YouTube:pref_default_hq_summary", "hu": "Start videos in high quality when connected to a mobile network. Startup may take longer.", "de": "Spielen Sie Videos in hoher Qualität ab, wenn Sie mit einem Mobilfunknetz verbunden sind. Der Start dauert möglicherweise länger.", "fr": "Lancez les vidéos en haute qualité lorsque vous êtes connecté à un réseau mobile. Le démarrage risque de prendre plus de temps.", "es": "Inicia vídeos en alta calidad cuando te conectes a una red móvil. El inicio puede tardar.", "en": "Start videos in high quality when connected to a mobile network. Startup may take longer."},
    "Caption font size": {"res": "YouTube:pref_subtitles_size_title", "hu": "Caption font size", "de": "Untertitelgröße", "fr": "Taille de police des sous-titres", "es": "Tamaño fuente subtítulo"},
    "Sets the font size to use for captions": {"res": "YouTube:pref_subtitles_size_summary", "hu": "Sets the font size to use for captions", "de": "Legt die Schriftgröße der Untertitel fest.", "fr": "Définit la taille de caractères à utiliser dans les sous-titres", "es": "Define el tamaño de fuente que se va a utilizar en los subtítulos."},
    "Small": {"res": "YouTube:@array/subtitles_size_entries:0", "hu": "Small", "de": "Klein", "fr": "Petite", "es": "Pequeño"},
    "Medium": {"res": "YouTube:@array/subtitles_size_entries:1", "hu": "Medium", "de": "Mittel", "fr": "Moyenne", "es": "Mediano"},
    "Large": {"res": "YouTube:@array/subtitles_size_entries:2", "hu": "Large", "de": "Groß", "fr": "Grande", "es": "Grande"},
    "Extra Large": {"res": "YouTube:@array/subtitles_size_entries:3", "hu": "Extra Large", "de": "Extragroß", "fr": "Très grande", "es": "Muy grande"},
    "Search settings": {"res": "YouTube:pref_search_category", "hu": "Search settings", "de": "Sucheinstellungen", "fr": "Paramètres de recherche", "es": "Ajustes de búsqueda"},
    "Clear search history": {"res": "YouTube:pref_clear_search_history_title", "hu": "Clear search history", "de": "Suchverlauf löschen", "fr": "Eff. historique recherches", "es": "Borrar historial de búsqueda"},
    "Clear previous YouTube searches from showing up in the Search box": {"res": "YouTube:pref_clear_search_history_summary", "hu": "Clear previous YouTube searches from showing up in the Search box", "de": "Frühere Suchen auf YouTube aus Suchfeld löschen", "fr": "Supprimer l'historique des recherches YouTube", "es": "Borrar búsquedas anteriores de YouTube para que no aparezcan en el cuadro de búsqueda"},
    "SafeSearch filtering": {"res": "YouTube:pref_safe_search_title", "hu": "SafeSearch filtering", "de": "SafeSearch-Filter", "fr": "Filtrage SafeSearch", "es": "Filtrado de SafeSearch"},
    "Block videos containing restricted content from appearing in search results": {"res": "YouTube:pref_safe_search_summary", "hu": "Block videos containing restricted content from appearing in search results", "de": "Videos, die zugriffsbeschränkten Content enthalten, nicht in Suchergebnissen anzeigen", "fr": "Retirer des résultats de recherche les vidéos dont le contenu est soumis à restriction", "es": "Bloquear vídeos con contenido restringido en los resultados de búsqueda."},
    "SafeSearch": {"res": "YouTube:safe_search_dialog_title", "hu": "SafeSearch", "de": "SafeSearch", "fr": "SafeSearch", "es": "SafeSearch"},
    "Don't filter": {"res": "YouTube:@array/safe_search_levels:0", "hu": "Don't filter", "de": "Nicht filtern", "fr": "Ne pas filtrer", "es": "No filtrar"},
    "Moderate": {"res": "YouTube:@array/safe_search_levels:1", "hu": "Moderate", "de": "Moderat", "fr": "Modéré", "es": "Moderado"},
    "Strict": {"res": "YouTube:@array/safe_search_levels:2", "hu": "Strict", "de": "Strikt", "fr": "Strict", "es": "Estricto"},
    "About": {"res": "YouTube:pref_about_category", "hu": "About", "de": "Info", "fr": "À propos de", "es": "Acerca de"},
    "Help": {"res": "YouTube:pref_help_title", "hu": "Help", "de": "Hilfe", "fr": "Aide", "es": "Ayuda"},
    "Find answers to your YouTube questions here": {"res": "YouTube:pref_help_summary", "hu": "Find answers to your YouTube questions here", "de": "Hier findest du Antworten auf deine Fragen zu YouTube.", "fr": "Trouvez ici la réponse à vos questions concernant YouTube", "es": "Encuentra respuestas a tus preguntas de YouTube aquí."},
    "Feedback": {"res": "YouTube:pref_feedback_title", "hu": "Feedback", "de": "Feedback", "fr": "Commentaires", "es": "Comentarios"},
    "Help us make YouTube better": {"res": "YouTube:pref_feedback_summary", "hu": "Help us make YouTube better", "de": "Hilf uns, YouTube zu verbessern", "fr": "Aidez-nous à améliorer YouTube.", "es": "Ayúdanos a mejorar YouTube."},
    "Google Mobile Terms of Service": {"res": "YouTube:pref_mobile_terms_title", "hu": "Google Mobile Terms of Service", "de": "Google Mobile-Nutzung", "fr": "Conditions d'utilisation Google Mobile", "es": "Condiciones servicio móviles"},
    "Read Google Mobile Terms of Service": {"res": "YouTube:pref_mobile_terms_summary", "hu": "Read Google Mobile Terms of Service", "de": "Nutzungsbedingungen von Google Mobile lesen", "fr": "Lisez les conditions d'utilisation de Google Mobile.", "es": "Consultar las Condiciones del servicio de Google para móviles"},
    "YouTube Terms of Service": {"res": "YouTube:pref_youtube_terms_title", "hu": "YouTube Terms of Service", "de": "YouTube-Nutzung", "fr": "Conditions d'utilisation YouTube", "es": "Términos uso de YouTube"},
    "Read YouTube's Terms of Service": {"res": "YouTube:pref_youtube_terms_summary", "hu": "Read YouTube's Terms of Service", "de": "Nutzungsbedingungen von YouTube lesen", "fr": "Lisez les conditions d'utilisation de YouTube.", "es": "Consultar los Términos de uso de YouTube"},
    "Google Mobile Privacy Policy": {"res": "YouTube:pref_mobile_privacy_title", "hu": "Google Mobile Privacy Policy", "de": "Mobile-Datenschutz", "fr": "Règles de confidentialité - Mobile", "es": "Política privacidad móviles"},
    "Read Google Mobile Privacy Policy": {"res": "YouTube:pref_mobile_privacy_summary", "hu": "Read Google Mobile Privacy Policy", "de": "Datenschutzbestimmungen von Google Mobile lesen", "fr": "Lisez les règles de confidentialité de Google Mobile.", "es": "Consultar la Política de privacidad de Google para móviles"},
    "YouTube Privacy Policy": {"res": "YouTube:pref_youtube_privacy_title", "hu": "YouTube Privacy Policy", "de": "YouTube-Datenschutz", "fr": "Règles de confidentialité - YouTube", "es": "Política privacidad YouTube"},
    "Read YouTube's Privacy Policy": {"res": "YouTube:pref_youtube_privacy_summary", "hu": "Read YouTube's Privacy Policy", "de": "Datenschutzbestimmungen von YouTube lesen", "fr": "Lisez les règles de confidentialité de YouTube.", "es": "Consultar la Política de privacidad de YouTube"},
    "Application version": {"res": "YouTube:pref_version_title", "hu": "Application version", "de": "Anwendungsversion", "fr": "Version de l'application", "es": "Versión de la aplicación"}
  };
  const T = GBApps.texts(STRINGS);
  const A = name => `assets/yt-${name}.png`;
  const CATEGORIES = ['Autos & Vehicles', 'Comedy', 'Education', 'Entertainment', 'Film & Animation', 'Gaming', 'Howto & Style', 'Music', 'News & Politics', 'Nonprofits & Activism', 'People & Blogs', 'Pets & Animals', 'Science & Technology', 'Sports', 'Travel & Events'];
  // Spring 2011 videos: [id, title, author, seconds, views, category, days ago, likes, dislikes, colours].
  const VIDEOS = [
    ['y1', 'Nexus S hands-on: Gingerbread, NFC and the curved glass', 'GadgetWeekly', 512, 1204311, 'Science & Technology', 40, 8123, 211, ['#1d3557', '#a8dadc']],
    ['y2', 'Gingerbread tips: 10 things to try on Android 2.3', 'DroidCorner', 375, 486020, 'Howto & Style', 25, 3920, 88, ['#264653', '#e9c46a']],
    ['y3', 'Cat vs. cardboard box — the rematch', 'WhiskerTV', 142, 9871442, 'Pets & Animals', 9, 51220, 960, ['#6d597a', '#e56b6f']],
    ['y4', 'Sunset timelapse over the old town bridge', 'Trail & Summit', 188, 52977, 'Travel & Events', 60, 1204, 15, ['#f4a261', '#2a9d8f']],
    ['y5', 'Learn three chords in ten minutes', 'StrumSchool', 603, 2311020, 'Music', 120, 22018, 410, ['#3a0ca3', '#f72585']],
    ['y6', 'Street football skills compilation', 'KickItTV', 255, 731554, 'Sports', 14, 6112, 199, ['#2b9348', '#eeef20']],
    ['y7', 'How a paper airplane really flies', 'Physics Explained', 421, 318020, 'Education', 75, 4502, 61, ['#023e8a', '#90e0ef']],
    ['y8', 'Unboxing the 2011 smartphone lineup', 'TechTalk Daily', 734, 155802, 'Science & Technology', 5, 1802, 77, ['#343a40', '#adb5bd']],
    ['y9', 'Five-minute pasta for busy evenings', 'Kitchen Corner', 301, 90311, 'Howto & Style', 33, 1350, 22, ['#9d0208', '#ffba08']],
    ['y10', 'Stand-up: smartphones and our grandparents', 'Laugh Track', 480, 2650098, 'Comedy', 19, 30512, 802, ['#5f0f40', '#fb8b24']]
  ].map(([id, title, author, seconds, views, category, days, likes, dislikes, colors]) => ({id, title, author, seconds, views, category, days, likes, dislikes, colors}));
  const COMMENTS = ['Great video, thanks for sharing!', 'Watching this on my Nexus S right now :)', 'The ending was the best part.', 'Subscribed!'];
  const video = id => VIDEOS.find(v => v.id === id);
  const length = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const views = (lang, n) => AndroidStrings.format(T(lang, '%1$,d views'), n.toLocaleString('en-US'));
  const ago = (lang, d) => d >= 60 ? AndroidStrings.format(T(lang, '%1$s months ago'), Math.round(d / 30)) : d >= 14 ? AndroidStrings.format(T(lang, '%1$s weeks ago'), Math.round(d / 7)) : AndroidStrings.format(T(lang, '%1$s days ago'), d);
  const thumb = (v, cls = '') => `<span class="yt-thumb ${cls}" style="--a:${v.colors[0]};--b:${v.colors[1]}"><em>${e(v.title.split(':')[0])}</em></span>`;
  const store = data => (data.youtube23 ||= {liked: {}, favorites: [], comments: {}});
  function header(ctx, title = '') {
    const {lang, ui} = ctx;
    const search = ui.ytSearching ? `<form class="yt-search" data-form="yt-search"><input name="q" value="${e(ui.ytQuery || '')}" placeholder="${e(T(lang, 'Search YouTube'))}" aria-label="${e(T(lang, 'Search YouTube'))}" autocomplete="off"></form>` : '';
    return `<div class="yt-header"><button class="yt-logo" data-action="yt-home" aria-label="YouTube"><img src="${A('logo')}" alt=""></button><span class="yt-hbtns"><img class="yt-hdiv" src="${A('header_divider')}" alt=""><button data-action="yt-upload" aria-label="${e(T(lang, 'Upload'))}"><img src="${A('ic_menu_capture_normal')}" alt=""></button><img class="yt-hdiv" src="${A('header_divider')}" alt=""><button data-action="yt-search-open" aria-label="${e(T(lang, 'Search'))}"><img src="${A('ic_menu_search_normal')}" alt=""></button></span></div>${search}${title ? `<div class="yt-title">${e(title)}</div>` : ''}`;
  }
  const row = (ctx, v) => `<button class="yt-item" data-action="yt-watch" data-id="${v.id}"><span class="yt-frame">${thumb(v)}<i class="yt-dur">${length(v.seconds)}</i></span><span class="yt-meta"><b>${e(v.title)}</b><small>${e(AndroidStrings.format(T(ctx.lang, 'by %1$s'), v.author))}${v.days <= 7 ? ` <i class="yt-new">New</i>` : ''}</small><small>${e(views(ctx.lang, v.views))}</small></span></button>`;
  function list(ctx) {
    const {ui, lang} = ctx;
    if (ui.ytPage === 'browse') return `<div class="app-view yt" data-no-translate>${header(ctx, T(lang, 'Browse'))}<div class="yt-scroll">${[T(lang, 'All'), ...CATEGORIES].map((c, i) => `<button class="yt-cat" data-action="yt-cat" data-id="${i ? e(CATEGORIES[i - 1]) : ''}">${e(c)}</button>`).join('')}</div></div>`;
    let items = [...VIDEOS], title = T(lang, 'Most viewed');
    if (ui.ytPage === 'results') { const q = (ui.ytQuery || '').toLowerCase(); items = VIDEOS.filter(v => [v.title, v.author, v.category].join(' ').toLowerCase().includes(q)); title = AndroidStrings.format(T(lang, 'Results for "%1$s"'), ui.ytQuery || ''); }
    else if (ui.ytPage === 'category') { items = ui.ytCat ? VIDEOS.filter(v => v.category === ui.ytCat) : VIDEOS; title = ui.ytCat || T(lang, 'All'); }
    else if (ui.ytPage === 'channel') { const s = store(ctx.data); items = VIDEOS.filter(v => s.favorites.includes(v.id)); title = T(lang, 'My Channel'); }
    else items.sort((a, b) => b.views - a.views);
    if (ui.ytFilter && ui.ytPage !== 'channel') items = items.filter(v => v.days <= {today: 1, week: 7, month: 31}[ui.ytFilter] || ui.ytFilter === 'all');
    return `<div class="app-view yt" data-no-translate>${header(ctx, title)}<div class="yt-scroll">${items.map(v => row(ctx, v)).join('') || `<p class="yt-empty">${e(T(lang, 'No videos found'))}</p>`}</div></div>`;
  }
  function watch(ctx) {
    const {ui, lang, data} = ctx, v = video(ui.ytWatch), s = store(data);
    if (!v) return list(ctx);
    const tab = ui.ytTab || 'info', rating = s.liked[v.id], fav = s.favorites.includes(v.id), pos = Math.min(v.seconds, ui.ytPos || 0);
    const tabs = [['info', T(lang, 'Info')], ['related', T(lang, 'Related videos')], ['comments', T(lang, 'Comments')]].map(([id, label]) => `<button class="yt-tab${tab === id ? ' on' : ''}" data-action="yt-tab" data-id="${id}">${e(label)}</button>`).join('');
    const tool = (action, img, label, on = false) => `<button class="yt-tool${on ? ' on' : ''}" data-action="${action}" aria-label="${e(label)}"><img src="${A(img)}" alt=""></button>`;
    const likes = v.likes + (rating === 1 ? 1 : 0), dislikes = v.dislikes + (rating === -1 ? 1 : 0);
    const info = `<div class="yt-info"><h3>${e(v.title)}</h3><p><span class="grey">${e(ago(lang, v.days))} — </span>${e(views(lang, v.views))}</p><p class="grey">${e(AndroidStrings.format(T(lang, '%1$d likes, %2$d dislikes'), likes, dislikes))}</p>${rating ? `<p>${e(T(lang, rating > 0 ? 'You like this video' : 'You dislike this video'))}</p>` : ''}<button class="yt-channel" data-action="yt-author">${e(v.author)}</button><b>${e(T(lang, 'Description'))}</b><p>${e(`${v.title}. Uploaded by ${v.author}.`)}</p><b>${e(T(lang, 'Category'))}</b><p class="grey">${e(v.category)}</p><b>${e(T(lang, 'Tags'))}</b><p class="grey">${e(v.category.toLowerCase().split(/\W+/).filter(Boolean).join(' '))} android 2011</p></div>`;
    const related = VIDEOS.filter(x => x.id !== v.id && (x.category === v.category || x.views > 500000)).slice(0, 6).map(x => row(ctx, x)).join('');
    const comments = [...(s.comments[v.id] || []).map(c => ({author: 'me', text: c, time: ''})), ...COMMENTS.map((c, i) => ({author: ['jake88', 'anna_k', 'mrtechguy', 'sunnyday'][i], text: c, time: ago(lang, v.days - i > 0 ? v.days - i : 1)}))];
    const commentList = `<form class="yt-comment" data-form="yt-comment"><input name="text" placeholder="${e(T(lang, 'Respond to this video...'))}" aria-label="${e(T(lang, 'Respond to this video...'))}" autocomplete="off"><button type="submit">${e(T(lang, 'Post'))}</button></form>${comments.map(c => `<div class="yt-c"><b>${e(c.author)}</b><span>${e(c.text)}</span>${c.time ? `<small>${e(c.time)}</small>` : ''}</div>`).join('')}`;
    const playing = ui.ytPlaying && pos < v.seconds;
    return `<div class="app-view yt yt-watch" data-no-translate>${header(ctx)}<div class="yt-player${playing ? ' playing' : ''}" style="--a:${v.colors[0]};--b:${v.colors[1]}"><button class="yt-screen" data-action="yt-play" aria-label="Play"><em>${e(v.title)}</em>${playing ? '' : `<img class="yt-paused" src="${A(pos >= v.seconds ? 'player_replay_off' : 'player_osd_paused')}" alt="">`}</button><div class="yt-bar"><span>${length(Math.floor(pos))}</span><i class="yt-track"><i style="width:${pos / v.seconds * 100}%"></i></i><span>${length(v.seconds)}</span></div></div><div class="yt-tools">${tool('yt-like', 'ic_like', T(lang, 'You like this video'), rating === 1)}${tool('yt-dislike', 'ic_dislike', T(lang, 'You dislike this video'), rating === -1)}${tool('yt-fav', fav ? 'ic_unfavorite' : 'ic_favorite', T(lang, fav ? 'Unfavorite' : 'Favorite'), fav)}${tool('yt-share', 'ic_share', T(lang, 'Share'))}${tool('yt-flag', 'ic_flag', T(lang, 'Flag'))}</div><div class="yt-tabs">${tabs}</div><div class="yt-scroll yt-work">${tab === 'related' ? related : tab === 'comments' ? commentList : info}</div></div>`;
  }
  function render(ctx) { return ctx.ui.ytWatch ? watch(ctx) : list(ctx); }
  // The player plays the made-up video in real time while it is on screen.
  let playTimer = 0;
  function mounted(ctx) {
    clearInterval(playTimer);
    const {ui} = ctx, v = video(ui.ytWatch); if (!v || !ui.ytPlaying) return;
    playTimer = setInterval(() => {
      if (ui.view !== 'youtube' || ui.ytWatch !== v.id || !ui.ytPlaying) { clearInterval(playTimer); return; }
      ui.ytPos = Math.min(v.seconds, (ui.ytPos || 0) + 1);
      const bar = document.querySelector('.yt-track i'), time = document.querySelector('.yt-bar span');
      if (bar) bar.style.width = `${ui.ytPos / v.seconds * 100}%`; if (time) time.textContent = length(ui.ytPos);
      if (ui.ytPos >= v.seconds) { ui.ytPlaying = false; clearInterval(playTimer); ctx.render(); }
    }, 1000);
  }
  function menu(ctx) {
    const {lang} = ctx, t = k => T(lang, k);
    return [{action: 'yt-home', title: t('Home'), icon: 'yt-ic_menu_home.png'}, {action: 'yt-browse', title: t('Browse'), icon: 'yt-ic_menu_browse.png'}, {action: 'yt-channel-open', title: t('My Channel'), icon: 'yt-ic_menu_my_channel.png'},
      {action: 'yt-upload', title: t('Upload'), icon: 'yt-ic_menu_capture_normal.png'}, {action: 'yt-search-open', title: t('Search'), icon: 'ic_menu_search'}, {action: 'gbpref-open', id: 'youtube', title: t('Settings'), icon: 'ic_menu_preferences'}];
  }
  function dialog(kind, ctx) {
    const {lang} = ctx, t = k => T(lang, k);
    if (kind === 'filter') return {title: t('Time filter'), items: [['today', 'Today'], ['week', 'This week'], ['month', 'This month'], ['all', 'All time']].map(([id, l]) => ({action: 'yt-filter', id, title: t(l)})), choice: 'single', selected: ['today', 'week', 'month', 'all'].indexOf(ctx.ui.ytFilter || 'all')};
    if (kind === 'share') return {title: t('Share this video via'), items: [['gmail', 'Gmail'], ['messaging', 'Messaging'], ['email', 'Email']].map(([id, n]) => ({action: 'yt-share-to', id, title: ctx.t(n), icon: `${id}.png`}))};
    return null;
  }
  function handle(action, id, ctx) {
    const {ui, data, lang} = ctx, s = store(data), close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    const go = page => { close(); ui.ytWatch = ''; ui.ytPage = page; ui.ytSearching = false; ctx.render(); };
    switch (action) {
      case 'yt-home': go(''); break;
      case 'yt-browse': go('browse'); break;
      case 'yt-channel-open': go('channel'); break;
      case 'yt-cat': ui.ytCat = id; ui.ytFilter = ''; go('category'); ctx.dialog('filter'); break;
      case 'yt-filter': ui.ytFilter = id; close(); ctx.render(); break;
      case 'yt-search-open': close(); ui.ytSearching = true; ctx.render(); ctx.focus('.yt-search input'); break;
      case 'yt-watch': ui.ytWatch = id; ui.ytTab = 'info'; ui.ytPos = 0; ui.ytPlaying = true; ui.ytSearching = false; ctx.render(); ctx.toast(T(lang, 'Rotate or double tap the video to toggle fullscreen')); break;
      case 'yt-play': { const v = video(ui.ytWatch); if (!v) break; if ((ui.ytPos || 0) >= v.seconds) ui.ytPos = 0; ui.ytPlaying = !ui.ytPlaying; ctx.render(); break; }
      case 'yt-tab': ui.ytTab = id; ctx.render(); break;
      case 'yt-like': s.liked[ui.ytWatch] = s.liked[ui.ytWatch] === 1 ? 0 : 1; ctx.save(); ctx.render(); break;
      case 'yt-dislike': s.liked[ui.ytWatch] = s.liked[ui.ytWatch] === -1 ? 0 : -1; ctx.save(); ctx.render(); break;
      case 'yt-fav': { const i = s.favorites.indexOf(ui.ytWatch); if (i >= 0) s.favorites.splice(i, 1); else s.favorites.push(ui.ytWatch); ctx.save(); ctx.render(); ctx.toast(T(lang, i >= 0 ? 'Video removed from favorites' : 'Video added to favorites')); break; }
      case 'yt-share': ctx.dialog('share'); break;
      case 'yt-share-to': close(); ctx.openApp(id); break;
      case 'yt-author': { const v = video(ui.ytWatch); ui.ytQuery = v?.author || ''; go('results'); break; }
      case 'yt-upload': close(); ctx.openApp('camera'); break;
      case 'yt-flag': case 'yt-unsupported': close(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  function submit(form, values, ctx) {
    const {ui, data, lang} = ctx;
    // Each search is kept for the Search box's history (Settings' Clear search history empties it).
    if (form === 'yt-search') { const q = String(values.get('q') || '').trim(); if (!q) return true; const s = store(ctx.data); s.searches = [q, ...(s.searches || []).filter(x => x !== q)].slice(0, 10); ctx.save(); ui.ytQuery = q; ui.ytPage = 'results'; ui.ytWatch = ''; ui.ytSearching = false; ctx.render(); return true; }
    if (form === 'yt-comment') { const text = String(values.get('text') || '').trim(); if (!text) return true; const s = store(data); (s.comments[ui.ytWatch] ||= []).unshift(text); ctx.save(); ctx.render(); ctx.toast(T(lang, 'Comment posted')); return true; }
    return false;
  }
  function back(ctx) {
    const {ui} = ctx;
    if (ui.ytSearching) { ui.ytSearching = false; ctx.render(); return true; }
    if (ui.ytWatch) { ui.ytWatch = ''; ui.ytPlaying = false; ctx.render(); return true; }
    if (ui.ytPage === 'category') { ui.ytPage = 'browse'; ctx.render(); return true; }
    if (ui.ytPage) { ui.ytPage = ''; ctx.render(); return true; }
    return false;
  }
  function open(ctx, resume) { if (!resume) Object.assign(ctx.ui, {ytWatch: '', ytPage: '', ytSearching: false, ytPlaying: false}); }
  GBApps.register('youtube', {render, mounted, menu, dialog, handle, submit, back, open, scroll: '.yt-scroll'});
  window.GBYouTube = {VIDEOS, CATEGORIES, T};
})();
