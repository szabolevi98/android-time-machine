/* Google Play Store 5.2.13 (com.android.vending), the Phonesky.apk of the Nexus 6's LMY48Y image, rebuilt from that APK:
   texts in five languages from its resources (docs/tools/apk-strings.py), drawables from its xxxhdpi / xxhdpi set
   (assets/ps5213-*), colours and sizes from its values, styles and layouts, the drawer, the details modules and the
   settings from its code (classes.dex inside the image's arm/Phonesky.odex) and res/xml/settings.xml.
   - FinskyTheme is Theme.AppCompat.Light.NoActionBar on #EEEEEE: the 56 dp search_toolbar in the corpus colour
     (play_*_primary; the status bar takes status_bar_*), the 20 sp Roboto Medium title, ic_search_white; corpus pages and
     My apps carry the PlayHeaderListTabStrip (48 dp, 14 sp Roboto Medium, a white underline) in the same colour.
   - FinskyDrawerLayout.createPrimaryActions / createSecondaryActions: Store home, My apps, My wishlist, People, My
     account (24 dp icons, 14 sp Roboto Medium, the current one bold on #EEEEEE with its _selected icon), a 1 dp
     #E5E5E5 separator, then Redeem, Settings and Help & Feedback; play_drawer_profile_info (148 dp cover, 64 dp avatar).
   - Home: the quick links (48 dp, the corpus colour, white upper-case 13 sp titles, PlayQuickLinkBase.bind) and
     play_card_cluster (20 dp side padding, 18 sp Roboto Medium title, 16 sp #616161 subtitle, the MORE box), cards
     on PlayCardViewGroup (#FAFAFA, 2 dp corners, 2 dp elevation, 4 dp inset): 16 sp title over two lines, 12 sp
     subtitle, the 11 dp StarRatingBar (#616161 on #70616161) and the price label.
   - Details (ModulesManager.DETAILS_MODULES): the hero, TitleModule (thumbnail, 20 sp title, 14 sp #616161
     creator, the wishlist bookmark, the action buttons or details_download_progress), DiscoveryBar (60 dp badges),
     DescriptionTextModule (the 16 sp Roboto Light callout and READ MORE), Screenshots (240 dp), RateReview (owned:
     "Rate this app" over the stars), ReviewsSamples (HistogramView: the 56 sp Light average, 8 dp bars of at most
     160 dp), SecondaryActions (Wishlist, Share, +1'd this), a Similar cluster, Bylines (DetailsBylinesSection: the
     Developer links of getBylineEntries) and FlagContent.
   - AppsPermissionsActivity (FinskyLightDialogTheme: a Holo Light dialog): the app, "<b>%1$s</b> needs access to",
     the permission buckets with their ic_perm_* icons, ACCEPT; RateReviewActivity's "Rate it!"; Settings on
     Theme.Material.Light.DarkActionBar with the #455A64 bar (SettingsActionBarStyle).
   The catalog, cluster titles and list names are the simulator's own storefront (on the device they came from the
   server); 1 dp = 0.906 CSS px on the Nexus 6 screen. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = {
    "Google Play": {"res": "Phonesky:app_name", "hu": "Google Play", "de": "Google Play", "fr": "Google Play", "es": "Google Play"},
    "Store home": {"res": "Phonesky:menu_home", "hu": "Az Áruház főoldala", "de": "Play Store", "fr": "Accueil du Play Store", "es": "Inicio de Play Store"},
    "My apps": {"res": "Phonesky:my_downloads_menu", "hu": "Alkalmazásaim", "de": "Meine Apps", "fr": "Mes applications", "es": "Mis aplicaciones"},
    "My wishlist": {"res": "Phonesky:menu_my_wishlist", "hu": "Saját kívánságlista", "de": "Meine Wunschliste", "fr": "Ma liste de souhaits", "es": "Mi lista de deseos"},
    "People": {"res": "Phonesky:side_drawer_social_home", "hu": "Ismerősök", "de": "Personen", "fr": "Contacts", "es": "Personas"},
    "My account": {"res": "Phonesky:side_drawer_my_account", "hu": "Saját fiók", "de": "Mein Konto", "fr": "Mon compte", "es": "Mi cuenta"},
    "Redeem": {"res": "Phonesky:redeem_gift_card_menu", "hu": "Beváltás", "de": "Einlösen", "fr": "Utiliser un code", "es": "Canjear"},
    "Settings": {"res": "Phonesky:settings", "hu": "Beállítások", "de": "Einstellungen", "fr": "Paramètres", "es": "Ajustes"},
    "Help & Feedback": {"res": "Phonesky:help_and_feedback", "hu": "Súgó és visszajelzés", "de": "Hilfe & Feedback", "fr": "Aide et commentaires", "es": "Ayuda y sugerencias"},
    "Show navigation drawer": {"res": "Phonesky:play_drawer_open", "hu": "Navigációs fiók megjelenítése", "de": "Navigationsleiste einblenden", "fr": "Afficher le panneau de navigation", "es": "Mostrar panel de navegación"},
    "Navigate up": {"res": "Phonesky:abc_action_bar_up_description", "hu": "Felfelé mozgatás", "de": "Nach oben", "fr": "Revenir en haut de la page", "es": "Desplazarse hacia arriba"},
    "Search Google Play": {"res": "Phonesky:search_hint", "hu": "Keresés a Google Playen", "de": "In Play suchen", "fr": "Rechercher", "es": "Buscar"},
    "More options": {"res": "Phonesky:abc_action_menu_overflow_description", "hu": "További lehetőségek", "de": "Weitere Optionen", "fr": "Plus d'options", "es": "Más opciones"},
    "Options": {"res": "Phonesky:content_description_options", "hu": "Beállítások", "de": "Optionen", "fr": "Options", "es": "Opciones"},
    "Include in wishlist": {"res": "Phonesky:content_description_wishlist_add", "hu": "Felvétel a kívánságlistára", "de": "Zu Wunschliste hinzu", "fr": "Ajouter à la liste de souhaits", "es": "Incluir en lista de deseos"},
    "Remove from wishlist": {"res": "Phonesky:content_description_wishlist_remove", "hu": "Eltávolítás a listáról", "de": "Von Wunschliste entfernen", "fr": "Retirer de la liste de souhaits", "es": "Eliminar de lista de deseos"},
    "Add to wishlist": {"res": "Phonesky:wishlist_add", "hu": "Felvétel a kívánságlistára", "de": "Auf die Wunschliste", "fr": "Ajouter à la liste de souhaits", "es": "Añadir a la lista de deseos"},
    "Remove from wishlist ": {"res": "Phonesky:wishlist_remove", "hu": "Eltávolítás a listáról", "de": "Von Wunschliste entfernen", "fr": "Retirer de la liste de souhaits", "es": "Eliminar de lista de deseos", "en": "Remove from wishlist"},
    "more": {"res": "Phonesky:more_results_no_count", "hu": "továbbiak", "de": "mehr", "fr": "plus", "es": "más"},
    "%1$d more": {"res": "Phonesky:more_results", "hu": "%1$d további", "de": "%1$d weitere", "fr": "%1$d de plus", "es": "%1$d más"},
    "Install": {"res": "Phonesky:install", "hu": "Telepítés", "de": "Installieren", "fr": "Installer", "es": "Instalar"},
    "Uninstall": {"res": "Phonesky:uninstall", "hu": "Eltávolítás", "de": "Deinstallieren", "fr": "Désinstaller", "es": "Desinstalar"},
    "Open": {"res": "Phonesky:open", "hu": "Megnyitás", "de": "Öffnen", "fr": "Ouvrir", "es": "Abrir"},
    "Update": {"res": "Phonesky:update", "hu": "Frissítés", "de": "Aktualisieren", "fr": "Mettre à jour", "es": "Actualizar"},
    "Buy %1$s": {"res": "Phonesky:buy", "hu": "Vásárlás – %1$s", "de": "Für %1$s kaufen", "fr": "Acheter (%1$s)", "es": "Comprar por %1$s"},
    "Installed": {"res": "Phonesky:installed_list_state", "hu": "Telepítve", "de": "Installiert", "fr": "Installé", "es": "Instalada"},
    "Up to date": {"res": "Phonesky:installed_section", "hu": "Naprakész", "de": "Aktuell", "fr": "À jour", "es": "Actualizadas"},
    "Installed ": {"res": "Phonesky:my_apps_tab_installed", "hu": "Telepítve", "de": "Installiert", "fr": "Applications installées", "es": "Instaladas", "en": "Installed"},
    "All": {"res": "Phonesky:my_apps_tab_library", "hu": "Összes", "de": "Alle", "fr": "Toutes", "es": "Todas"},
    "Remove": {"res": "Phonesky:archive_label", "hu": "Eltávolítás", "de": "Entfernen", "fr": "Supprimer", "es": "Eliminar"},
    "Apps and games installed from Google Play Store will appear here.": {"res": "Phonesky:empty_myapps_description_installed", "hu": "A Google Play Áruházból telepített alkalmazások és játékok itt fognak megjelenni.", "de": "Hier werden Apps und Spiele angezeigt, die über den Google Play Store installiert wurden.", "fr": "Les applications et les jeux installés depuis le Google Play Store s'affichent ici.", "es": "Las aplicaciones y los juegos instalados desde Google Play Store aparecerán aquí."},
    "There are no items in your wishlist. To add items, tap the bookmark whenever you see it in the menu above.": {"res": "Phonesky:my_wishlist_empty", "hu": "A kívánságlista üres. Elemek hozzáadásához koppints a könyvjelzőre, amikor az megjelenik a menüben.", "de": "Es befinden sich keine Artikel auf Ihrer Wunschliste. Berühren Sie das Lesezeichen oben im Menü, um Artikel hinzuzufügen.", "fr": "Aucun article dans votre liste de souhaits. Pour en ajouter, appuyez sur l'icône d'ajout aux favoris si celle-ci est disponible dans le menu ci-dessus.", "es": "No tienes elementos en tu lista de deseos. Para añadir elementos, toca el marcador cuando aparezca en el menú de arriba."},
    "No results found for \"%1$s\".": {"res": "Phonesky:no_results_for_query", "hu": "Nincs találat a következőre: \"%1$s\".", "de": "Keine Ergebnisse für \"%1$s\" gefunden", "fr": "Aucun résultat trouvé pour \"%1$s\".", "es": "No se han encontrado resultados de \"%1$s\"."},
    "Downloads": {"res": "Phonesky:app_downloads", "hu": "Letöltések", "de": "Downloads", "fr": "Téléchargements", "es": "Descargas"},
    "READ MORE": {"res": "Phonesky:read_more", "hu": "OLVASS TOVÁBB", "de": "Weiterlesen", "fr": "LIRE LA SUITE", "es": "MÁS INFORMACIÓN"},
    "What's new": {"res": "Phonesky:details_whats_new", "hu": "Újdonságok", "de": "Neue Funktionen", "fr": "Nouveautés", "es": "Novedades"},
    "Reviews": {"res": "Phonesky:details_reviews", "hu": "Vélemények", "de": "Bewertungen", "fr": "Commentaires", "es": "Opiniones"},
    "ALL REVIEWS": {"res": "Phonesky:all_reviews", "hu": "ÖSSZES VÉLEMÉNY", "de": "ALLE BEWERTUNGEN", "fr": "TOUS LES AVIS", "es": "TODAS LAS OPINIONES"},
    "Rate this app": {"res": "Phonesky:rate_this_app", "hu": "Alkalmazás értékelése", "de": "App bewerten", "fr": "Noter cette application", "es": "Valorar esta aplicación"},
    "Your review": {"res": "Phonesky:my_review", "hu": "A te véleményed", "de": "Meine Bewertung", "fr": "Votre avis", "es": "Tu opinión"},
    "Rate it!": {"res": "Phonesky:review_dialog_title", "hu": "Értékeld!", "de": "Jetzt bewerten!", "fr": "Donnez votre avis !", "es": "¡Puntúalo!"},
    "Tap on the stars": {"res": "Phonesky:review_dialog_unrated", "hu": "Koppints a csillagokra", "de": "Auf die Sterne tippen", "fr": "Appuyez sur les étoiles.", "es": "Toca las estrellas"},
    "Hated it": {"res": "Phonesky:review_dialog_poor", "hu": "Utáltam", "de": "Richtig schlecht", "fr": "J'ai détesté.", "es": "No me ha gustado nada"},
    "Disliked it": {"res": "Phonesky:review_dialog_below_average", "hu": "Nem tetszett", "de": "Nicht so gut", "fr": "Je n'ai pas aimé.", "es": "No me ha gustado"},
    "It's OK": {"res": "Phonesky:review_dialog_average", "hu": "Elmegy", "de": "Mittelmäßig", "fr": "C'était pas mal.", "es": "Está bien"},
    "Liked it": {"res": "Phonesky:review_dialog_above_average", "hu": "Tetszett", "de": "Gut", "fr": "Ça m'a beaucoup plu.", "es": "Me ha gustado"},
    "Loved it": {"res": "Phonesky:review_dialog_excellent", "hu": "Imádtam", "de": "Exzellent", "fr": "J'ai adoré.", "es": "Me ha encantado"},
    "Title": {"res": "Phonesky:review_dialog_subject_hint", "hu": "Cím", "de": "Titel", "fr": "Titre", "es": "Título"},
    "Description": {"res": "Phonesky:review_dialog_body_hint", "hu": "Leírás", "de": "Beschreibung", "fr": "Description", "es": "Descripción"},
    "Wishlist": {"res": "Phonesky:details_secondary_action_wishlist", "hu": "Kívánságlista", "de": "Wunschliste", "fr": "Liste de souhaits", "es": "Lista de deseos"},
    "Share": {"res": "Phonesky:details_secondary_action_share", "hu": "Megosztás", "de": "Teilen", "fr": "Partager", "es": "Compartir"},
    "+1'd this": {"res": "Phonesky:details_secondary_action_plus_one", "hu": "+1-ek száma", "de": "Gibt hierfür +1", "fr": "a ajouté +1", "es": "han hecho +1"},
    "Developer": {"res": "Phonesky:details_developer_links", "hu": "Fejlesztő", "de": "Anbieter", "fr": "Développeur", "es": "Desarrollador"},
    "Visit webpage": {"res": "Phonesky:link_website", "hu": "A webhely felkeresése", "de": "Webseite besuchen", "fr": "Accéder au site Web", "es": "Visitar página web"},
    "Send email": {"res": "Phonesky:link_email", "hu": "E-mail küldése", "de": "E-Mail senden", "fr": "Envoyer un e-mail", "es": "Enviar correo"},
    "Share \"%1$s\" via": {"res": "Phonesky:share_dialog_title", "hu": "„%1$s” megosztása a következőn:", "de": "\"%1$s\" teilen über", "fr": "Partager \"%1$s\" via", "es": "Compartir \"%1$s\" a través de"},
    "Check out \"%1$s\"": {"res": "Phonesky:share_subject", "hu": "Nézd meg a következőt: \"%1$s\"", "de": "Das könnte interessant sein: \"%1$s\"", "fr": "Découvrez \"%1$s\"", "es": "Consultar %1$s"},
    "Privacy policy": {"res": "Phonesky:privacy_policy", "hu": "Adatvédelmi irányelvek", "de": "Datenschutzerklärung", "fr": "Règles de confidentialité", "es": "Política de privacidad"},
    "Permission details": {"res": "Phonesky:permission_details", "hu": "Engedély részletei", "de": "Berechtigungsdetails", "fr": "Détails des autorisations", "es": "Información sobre permisos"},
    "Flag as inappropriate": {"res": "Phonesky:flagging_title", "hu": "Megjelölés kifogásolhatóként", "de": "Als unangemessen melden", "fr": "Signaler du contenu pouvant offenser", "es": "Marcar como inadecuado"},
    "Cancel this download": {"res": "Phonesky:content_description_cancel_download", "hu": "Letöltés törlése", "de": "Download abbrechen", "fr": "Annuler téléchargement", "es": "Cancelar descarga"},
    "Installing…": {"res": "Phonesky:installing", "hu": "Telepítés...", "de": "Wird installiert...", "fr": "Installation...", "es": "Instalando…"},
    "OK": {"res": "Phonesky:ok", "hu": "OK", "de": "OK", "fr": "OK", "es": "Aceptar"},
    "Cancel": {"res": "Phonesky:cancel", "hu": "Mégse", "de": "Abbrechen", "fr": "Annuler", "es": "Cancelar"},
    "Do you want to uninstall this app?": {"res": "Phonesky:uninstall_app_msg", "hu": "Eltávolítod ezt az alkalmazást?", "de": "Möchten Sie diese App deinstallieren?", "fr": "Voulez-vous désinstaller cette application ?", "es": "¿Quieres desinstalar esta aplicación?"},
    "App permissions": {"res": "Phonesky:permissions_title", "hu": "Alkalmazás engedélyei", "de": "App-Berechtigungen", "fr": "Autorisations de l'application", "es": "Permisos de aplicaciones"},
    "%1$s needs access to": {"res": "Phonesky:app_needs_access_to", "hu": "A(z) <b>%1$s</b> alkalmazás a következőkhöz kér hozzáférést:", "de": "<b>%1$s</b> benötigt Zugriff auf", "fr": "L'accès aux éléments suivants est également requis pour l'application <b>%1$s</b> :", "es": "<b>%1$s</b> necesita acceder a", "en": "<b>%1$s</b> needs access to"},
    "Accept": {"res": "Phonesky:accept", "hu": "Elfogadom", "de": "Akzeptieren", "fr": "Accepter", "es": "Aceptar"},
    "Photos/Media/Files": {"res": "Phonesky:permission_bucket_photos_media_files_title", "hu": "Fotók/Médiaelemek/Fájlok", "de": "Fotos/Medien/Dateien", "fr": "Photos/Contenus multimédias/Fichiers", "es": "Fotos/archivos multimedia/archivos"},
    "Wi-Fi connection information": {"res": "Phonesky:permission_bucket_wifi_connection_info_title", "hu": "Wi-Fi-csatlakozási információk", "de": "WLAN-Verbindungsinformationen", "fr": "Information sur la connexion Wi-Fi", "es": "Información sobre la conexión Wi-Fi"},
    "Other": {"res": "Phonesky:permission_bucket_other_title", "hu": "Egyéb", "de": "Sonstiges", "fr": "Autres", "es": "Otros"},
    "Updates to %1$s may automatically add additional capabilities within each group. Learn more": {"res": "Phonesky:detailed_permissions_footer", "hu": "A(z) %1$s frissítésével előfordulhat, hogy az egyes csoportokhoz automatikusan további funkciók lesznek hozzárendelve. <a href=%2$s>További információ</a>", "de": "Updates für %1$s können in jeder Gruppe automatisch zusätzliche Funktionen hinzufügen. <a href=%2$s>Weitere Informationen</a>", "fr": "Les mises à jour de \"%1$s\" peuvent ajouter automatiquement des fonctionnalités au sein de chaque groupe. <a href=%2$s>En savoir plus</a>", "es": "Instalar actualizaciones de %1$s puede añadir automáticamente funciones adicionales dentro de cada grupo. <a href=%2$s>Más información</a>", "en": "Updates to %1$s may automatically add additional capabilities within each group. <a href=\"%2$s\">Learn more</a>"},
    "General": {"res": "Phonesky:settings_general_section_header", "hu": "Általános", "de": "Allgemein", "fr": "Paramètres généraux", "es": "General"},
    "Notifications": {"res": "Phonesky:notifications", "hu": "Értesítések", "de": "Benachrichtigungen", "fr": "Notifications", "es": "Notificaciones"},
    "Notify me about updates to apps or games that I downloaded": {"res": "Phonesky:notification_description", "hu": "Tájékoztasson a letöltött alkalmazások és játékok frissítéseiről", "de": "Ich möchte über Updates für heruntergeladene Apps oder Spiele informiert werden.", "fr": "M'avertir des mises à jour disponibles pour les applications ou les jeux que j'ai téléchargés", "es": "Notificarme sobre actualizaciones de aplicaciones o juegos que he descargado"},
    "Auto-update apps": {"res": "Phonesky:auto_update_label", "hu": "Alkalmazások automatikus frissítése", "de": "Automatische App-Updates", "fr": "Mise à jour automatique des applis", "es": "Actualizar automáticamente"},
    "Do not auto-update apps": {"res": "Phonesky:auto_update_value_disabled", "hu": "Ne frissítse automatikusan az alkalmazásokat", "de": "Keine automatischen App-Updates zulassen", "fr": "Ne pas mettre à jour automatiquement les applications", "es": "No actualizar las aplicaciones automáticamente"},
    "Auto-update apps at any time. Data charges may apply.": {"res": "Phonesky:auto_update_value_enabled", "hu": "Az alkalmazások bármikor automatikusan frissülhetnek. Előfordulhat, hogy a szolgáltató adatforgalmi díjat számít fel.", "de": "Apps jederzeit automatisch aktualisieren. Es können Gebühren für die Datenübertragung anfallen.", "fr": "Mettre à jour les applications à tout moment. Des frais supplémentaires liés à la consommation de données peuvent être facturés.", "es": "Actualizar aplicaciones automáticamente en cualquier momento. Es posible que se apliquen cargos de datos"},
    "Auto-update apps over Wi-Fi only": {"res": "Phonesky:auto_update_value_wifi_only", "hu": "Alkalmazások automatikus frissítése csak Wi-Fi hálózaton keresztül", "de": "Automatische App-Updates nur über WLAN zulassen", "fr": "Mettre à jour automatiquement les applications via Wi-Fi uniquement", "es": "Actualizar las aplicaciones automáticamente solo a través de Wi-Fi"},
    "Add icon to Home screen": {"res": "Phonesky:auto_add_shortcuts_label", "hu": "Ikon hozzáadása a Kezdőképernyőhöz", "de": "Symbol zu Startbildschirm hinzufügen", "fr": "Ajouter l'icône à l'écran d'accueil", "es": "Añadir icono a pantalla de inicio"},
    "For new apps": {"res": "Phonesky:auto_add_shortcuts_description", "hu": "Új alkalmazásokhoz", "de": "Für neue Apps", "fr": "Pour les nouvelles applications", "es": "Para nuevas aplicaciones"},
    "Clear local search history": {"res": "Phonesky:clear_local_history_title", "hu": "Helyi keresési előzmények törlése", "de": "Lokalen Suchverlauf löschen", "fr": "Effacer historique recherches local", "es": "Borrar historial de búsqueda local"},
    "Remove searches you have performed from this device": {"res": "Phonesky:clear_local_history_summary", "hu": "A végrehajtott keresések eltávolítása az eszközről", "de": "Auf diesem Gerät durchgeführte Suchen löschen", "fr": "Supprimer les recherches que vous avez effectuées à partir de cet appareil", "es": "Eliminar búsquedas realizadas con este dispositivo"},
    "User controls": {"res": "Phonesky:settings_user_controls_section_header", "hu": "Felhasználói vezérlők", "de": "Nutzersteuerung", "fr": "Commandes utilisateur", "es": "Controles de usuario"},
    "Content filtering": {"res": "Phonesky:content_filtering_label", "hu": "Tartalomszűrés", "de": "Filter für Inhalte", "fr": "Filtrage du contenu", "es": "Filtro de contenido"},
    "Set the content filtering level to restrict apps that can be downloaded": {"res": "Phonesky:content_filtering_description", "hu": "A tartalomszűrés szintjének beállítása a letölthető alkalmazások körének szűkítéséhez", "de": "Beschränken Sie über die Inhaltsfilterung den Zugriff auf Apps, die heruntergeladen werden können.", "fr": "Définir le niveau de filtrage du contenu afin de limiter les applications pouvant être téléchargées", "es": "Definir el nivel del filtro de contenido para restringir las aplicaciones que se pueden descargar"},
    "Require authentication": {"res": "Phonesky:purchase_auth_dialog_label", "hu": "Hitelesítés kérése", "de": "Authentifizierung erforderlich", "fr": "Exiger l'authentification", "es": "Pedir autenticación"},
    "For all purchases through Google Play on this device": {"res": "Phonesky:purchase_auth_value_always", "hu": "A Google Playen végrehajtott összes vásárlás esetében ezen az eszközön", "de": "Für alle Käufe bei Google Play auf diesem Gerät", "fr": "Pour tous les achats via Google Play sur cet appareil", "es": "Para todas las compras realizadas a través de Google Play en este dispositivo"},
    "Every 30 minutes": {"res": "Phonesky:purchase_auth_value_session", "hu": "30 percenként", "de": "Alle 30 Minuten", "fr": "Toutes les 30 minutes", "es": "Cada 30 minutos"},
    "Never": {"res": "Phonesky:purchase_auth_value_never", "hu": "Soha", "de": "Nie", "fr": "Jamais", "es": "Nunca"},
    "About": {"res": "Phonesky:settings_about_header", "hu": "Névjegy", "de": "Info", "fr": "À propos de", "es": "Acerca de"},
    "Open source licenses": {"res": "Phonesky:os_licenses_label", "hu": "Nyílt forráskódú licencek", "de": "Open-Source-Lizenzen", "fr": "Licences Open Source", "es": "Licencias de software libre"},
    "License details for open source software": {"res": "Phonesky:os_licenses_summary", "hu": "A nyílt forráskódú szoftverekhez kapcsolódó licenc részletei", "de": "Lizenzdetails für Open-Source-Software", "fr": "Informations sur la licence pour les logiciels Open Source", "es": "Detalles de la licencia de software de código abierto"},
    "Build version": {"res": "Phonesky:settings_build_version", "hu": "Build verziószáma", "de": "Build-Version", "fr": "Version", "es": "Versión de la compilación"},
    "Version: %1$s": {"res": "Phonesky:market_version", "hu": "Verzió: %1$s", "de": "Version: %1$s", "fr": "Version : %1$s", "es": "Versión: %1$s"},
    "Allow apps rated for": {"res": "Phonesky:content_filter_title", "hu": "Következő alkalmazások engedélyezése:", "de": "Folgende Apps zulassen", "fr": "Applications autorisées :", "es": "Permitir aplicaciones clasificadas para"},
    "Everyone": {"res": "Phonesky:content_filter_everyone", "hu": "Mindenki", "de": "Alle", "fr": "Pour tous", "es": "Para todos"},
    "Low maturity": {"res": "Phonesky:content_filter_low_maturity", "hu": "Alacsony besorolású", "de": "Stufe 3 - Niedrig", "fr": "Niveau 3 - Large", "es": "Nivel de madurez bajo"},
    "Medium maturity": {"res": "Phonesky:content_filter_medium_maturity", "hu": "Közepes besorolású", "de": "Stufe 2 - Mittel", "fr": "Niveau 2 - Modéré", "es": "Nivel de madurez medio"},
    "High maturity": {"res": "Phonesky:content_filter_high_maturity", "hu": "Magas besorolású", "de": "Stufe 1 - Hoch", "fr": "Niveau 1 - Strict", "es": "Nivel de madurez alto"},
    "Show all apps": {"res": "Phonesky:content_filter_show_all_apps", "hu": "Összes alkalmazás", "de": "Alle Apps anzeigen", "fr": "Afficher toutes app.", "es": "Mostrar todas"},
    "Set the content filtering level to restrict apps that can be downloaded to this device.": {"res": "Phonesky:info_about_content_filter", "hu": "A tartalomszűrés szintjének beállítása az eszközre letölthető alkalmazások körének szűkítéséhez.", "de": "Beschränken Sie über die Inhaltsfilterung den Zugriff auf Apps, die auf dieses Gerät heruntergeladen werden können.", "fr": "Permet de définir le niveau de filtrage du contenu de manière à limiter le type d'applications qui peuvent être téléchargées sur cet appareil.", "es": "Define el nivel del filtro de contenido para restringir las aplicaciones que se pueden descargar en este dispositivo."},
    "Auto-update": {"res": "Phonesky:allow_auto_updating", "hu": "Auto. frissítés", "de": "Autom. Update", "fr": "Mise à jour auto", "es": "Actualizar automáticamente"},
    "Successfully installed.": {"res": "Phonesky:notification_installation_success_message", "hu": "Sikeresen telepítve.", "de": "Installiert", "fr": "Installation réussie", "es": "Instalada correctamente"},
    "Choose Google Account": {"res": "Phonesky:select_account", "hu": "Google-fiók kiválasztása", "de": "Google-Konto auswählen", "fr": "Sélectionnez un compte Google", "es": "Seleccionar cuenta de Google"}
  };
  // The storefront itself (corpus and list names, cluster titles) came from Google's servers; these are the simulator's
  // own, and "Unavailable" is the simulator's note for what it does not do.
  const OWN = {
    'Apps': {own: true, hu: 'Alkalmazások', de: 'Apps', fr: 'Applications', es: 'Aplicaciones'},
    'Games': {own: true, hu: 'Játékok', de: 'Spiele', fr: 'Jeux', es: 'Juegos'},
    'Music': {own: true, hu: 'Zene', de: 'Musik', fr: 'Musique', es: 'Música'},
    'Books': {own: true, hu: 'Könyvek', de: 'Bücher', fr: 'Livres', es: 'Libros'},
    'Movies & TV': {own: true, hu: 'Filmek és TV', de: 'Filme & Serien', fr: 'Films et séries', es: 'Películas y TV'},
    'Newsstand': {own: true, hu: 'Újságos', de: 'Kiosk', fr: 'Kiosque', es: 'Kiosco'},
    'Categories': {own: true, hu: 'Kategóriák', de: 'Kategorien', fr: 'Catégories', es: 'Categorías'},
    'Genres': {own: true, hu: 'Műfajok', de: 'Genres', fr: 'Genres', es: 'Géneros'},
    'Home': {own: true, hu: 'Kezdőlap', de: 'Startseite', fr: 'Accueil', es: 'Inicio'},
    'Top Paid': {own: true, hu: 'Legnépszerűbb fizetős', de: 'Top-Kauf', fr: 'Top payants', es: 'Más vendido'},
    'Top Free': {own: true, hu: 'Legnépszerűbb ingyenes', de: 'Top-Gratis', fr: 'Top gratuits', es: 'Gratis más populares'},
    'Top Grossing': {own: true, hu: 'Legnagyobb bevétel', de: 'Umsatzstärkste', fr: 'Meilleures ventes', es: 'Más rentables'},
    'Top New Paid': {own: true, hu: 'Új fizetős', de: 'Neu & kostenpflichtig', fr: 'Nouveautés payantes', es: 'Novedades de pago'},
    'Top New Free': {own: true, hu: 'Új ingyenes', de: 'Neu & gratis', fr: 'Nouveautés gratuites', es: 'Novedades gratuitas'},
    'Trending': {own: true, hu: 'Felkapott', de: 'Im Trend', fr: 'Tendances', es: 'Tendencias'},
    'Top Albums': {own: true, hu: 'Legnépszerűbb albumok', de: 'Top-Alben', fr: 'Top albums', es: 'Álbumes más populares'},
    'Top Songs': {own: true, hu: 'Legnépszerűbb dalok', de: 'Top-Songs', fr: 'Top titres', es: 'Canciones más populares'},
    'New Releases': {own: true, hu: 'Újdonságok', de: 'Neuerscheinungen', fr: 'Nouveautés', es: 'Novedades'},
    'Top Selling': {own: true, hu: 'Legkelendőbb', de: 'Bestseller', fr: 'Meilleures ventes', es: 'Más vendidos'},
    'Free': {own: true, hu: 'Ingyenes', de: 'Kostenlos', fr: 'Gratuit', es: 'Gratis'},
    'Similar': {own: true, hu: 'Hasonló', de: 'Ähnlich', fr: 'Similaires', es: 'Similares'},
    'New + Updated Games': {own: true, hu: 'Új és frissített játékok', de: 'Neue + aktualisierte Spiele', fr: 'Jeux nouveaux et mis à jour', es: 'Juegos nuevos y actualizados'},
    'Recommended for You': {own: true, hu: 'Önnek ajánljuk', de: 'Empfehlungen für Sie', fr: 'Recommandations pour vous', es: 'Recomendado para ti'},
    'Staff Picks': {own: true, hu: 'A szerkesztők választása', de: 'Tipps der Redaktion', fr: 'Choix de l\'équipe', es: 'Selección del equipo'},
    'Our favourite apps this week': {own: true, hu: 'A hét kedvenc alkalmazásai', de: 'Unsere Lieblings-Apps der Woche', fr: 'Nos applis préférées de la semaine', es: 'Nuestras aplicaciones favoritas de la semana'},
    'Albums from $3.99': {own: true, hu: 'Albumok $3.99-tól', de: 'Alben ab 3,99 $', fr: 'Albums à partir de 3,99 $', es: 'Álbumes desde 3,99 $'},
    'Summer Demo Tapes': {own: true, hu: 'Nyári demófelvételek', de: 'Sommer-Demoaufnahmen', fr: 'Démos de l\'été', es: 'Maquetas de verano'},
    'Free classics': {own: true, hu: 'Ingyenes klasszikusok', de: 'Kostenlose Klassiker', fr: 'Classiques gratuits', es: 'Clásicos gratis'},
    'Timeless books, free': {own: true, hu: 'Időtálló könyvek ingyen', de: 'Zeitlose Bücher, kostenlos', fr: 'Des livres intemporels, gratuits', es: 'Libros eternos, gratis'},
    'Unavailable': {own: true, hu: 'Ebben a szimulátorban nem érhető el', de: 'In diesem Simulator nicht verfügbar', fr: 'Non disponible dans ce simulateur', es: 'No disponible en este simulador'}
  };
  // The APK's text (STRINGS) before the simulator's own (OWN), in the named form strings.js reads.
  const STR = AndroidStrings.table('', {...OWN, ...STRINGS}, key => key.trim());
  const text = (lang, key) => STR.t(key, lang);
  const fmt = (s, ...args) => AndroidStrings.format(s, ...args);
  const VERSION = '5.2.13';
  // Corpus colours (values/colors.xml: play_*_primary, status_bar_*, play_*_light).
  const SECTIONS = [
    ['apps', 'Apps', '#689F38', '#558B2F'], ['games', 'Games', '#689F38', '#558B2F'], ['movies', 'Movies & TV', '#ED3B3B', '#D23F31'],
    ['music', 'Music', '#EF6C00', '#E65100'], ['books', 'Books', '#039BE5', '#0277BD'], ['magazines', 'Newsstand', '#536DFE', '#304FFE']
  ];
  const TABS = {
    apps: ['Categories', 'Home', 'Top Paid', 'Top Free', 'Top Grossing', 'Top New Paid', 'Top New Free', 'Trending'],
    games: ['Categories', 'Home', 'Top Paid', 'Top Free', 'Top Grossing', 'Top New Paid', 'Top New Free', 'Trending'],
    music: ['Genres', 'Home', 'Top Albums', 'Top Songs', 'New Releases'],
    books: ['Categories', 'Home', 'Top Selling', 'New Releases', 'Top Free'],
    movies: ['Categories', 'Home', 'Top Selling', 'New Releases'],
    magazines: ['Categories', 'Home', 'Top Selling']
  };
  const EXTRA = [
    {id: 'lunar-golf', kind: 'games', art: 'golf', name: 'Lunar Golf', developer: 'Crater Games', rating: 4.4, price: '$0.99', size: '9.8MB', description: 'Eighteen holes in low gravity.', whatsnew: 'New night course.'},
    {id: 'pocket-planner', kind: 'apps', art: 'planner', name: 'Pocket Planner', developer: 'Quiet Tools', rating: 4.3, price: '$1.99', size: '1.6MB', description: 'Plan your week on one simple page.', whatsnew: 'Now with a Lollipop widget.'},
    {id: 'album-first-light', kind: 'music', name: 'First Light', developer: 'The Demo Tapes', rating: 4.6, price: '$5.99', colors: ['#2c3e57', '#f1b45d'], description: '12 songs. Includes "Blue Horizon" and "Afterglow".'},
    {id: 'album-after-hours', kind: 'music', name: 'After Hours', developer: 'The Demo Tapes', rating: 4.4, price: '$6.99', colors: ['#1c1530', '#b65fd8'], description: '10 songs. Includes "Night Drive".'},
    {id: 'album-small-worlds', kind: 'music', name: 'Small Worlds', developer: 'Paper Satellites', rating: 4.5, price: '$3.99', colors: ['#14403a', '#7fd6b4'], description: '9 songs. Includes "City Lights".'},
    {id: 'book-pride', kind: 'books', name: 'Pride and Prejudice', developer: 'Jane Austen', rating: 4.6, price: 'FREE', colors: ['#5d4a3a', '#c9b48a']},
    {id: 'book-holmes', kind: 'books', name: 'The Adventures of Sherlock Holmes', developer: 'Arthur Conan Doyle', rating: 4.7, price: 'FREE', colors: ['#28323c', '#a7b4bd']},
    {id: 'book-alice', kind: 'books', name: 'Alice\'s Adventures in Wonderland', developer: 'Lewis Carroll', rating: 4.5, price: 'FREE', colors: ['#3a5f8a', '#f0d48a']},
    {id: 'movie-orbit', kind: 'movies', name: 'Orbit Hopper: The Movie', developer: 'Animation', rating: 4.1, price: '$3.99', colors: ['#141c3a', '#8f7fff']},
    {id: 'movie-quiet', kind: 'movies', name: 'A Quiet Afternoon', developer: 'Drama', rating: 3.9, price: '$2.99', colors: ['#3a2a1c', '#e0a868']},
    {id: 'mag-pocket-tech', kind: 'magazines', name: 'Pocket Tech Monthly', developer: 'September 2015', rating: 4.2, price: '$2.99', colors: ['#1d2b45', '#5fb3e8'], description: 'Phones, tablets and the apps that matter. Single issue.'},
    {id: 'mag-trail', kind: 'magazines', name: 'Trail & Summit', developer: 'October 2015', rating: 4.4, price: '$3.99', colors: ['#2d3a1f', '#c9a85a'], description: 'Hiking routes, gear and mountain stories.'},
    {id: 'mag-kitchen', kind: 'magazines', name: 'Weekend Kitchen', developer: 'Autumn 2015', rating: 4.0, price: '$1.99', colors: ['#5a2018', '#f2b35e'], description: 'Fifty easy recipes for long autumn evenings.'}
  ];
  const DATES = ['September 24, 2015', 'September 2, 2015', 'August 14, 2015', 'July 30, 2015'];
  const catalog = () => (window.ICSPlayStore?.catalog || []).map((item, i) => ({...item, kind: item.category === 'Games' ? 'games' : 'apps', price: 'FREE', downloads: ['10,000,000+', '1,000,000+', '500,000+', '100,000+'][i % 4], votes: 12000 + i * 4173, updated: DATES[i % 4], plus: 120 + i * 37, size: String(item.size || '').replace(' ', ''), whatsnew: 'Bug fixes and performance improvements.'}));
  const all = () => [...catalog(), ...EXTRA.map(item => ({downloads: '50,000+', votes: 812, plus: 46, updated: item.kind === 'magazines' ? 'October 9, 2015' : 'August 3, 2015', size: item.kind === 'books' ? '1.2MB' : item.kind === 'magazines' ? '24MB' : item.kind === 'music' ? '96MB' : item.kind === 'movies' ? '820MB' : item.size, description: item.kind === 'books' ? 'A classic, free from Google Play Books.' : item.kind === 'movies' ? 'A feature film from the simulator\'s small demo shelf.' : item.description, ...item}))];
  const find = id => all().find(item => item.id === id);
  // The details page's Share: ACTION_SEND text/plain with share_subject and the item's play.google.com link in the
  // system chooser (share_dialog_title), offering the image's mail and chat apps; the package and the developer's address
  // are the storefront's own.
  const SHARE_TARGETS = [['gmail', 'Gmail'], ['email', 'Email'], ['hangouts', 'Hangouts']];
  const slug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '');
  const packageName = item => item.app ? `com.android.${slug(item.app)}` : `com.${slug(item.developer)}.${slug(item.name)}`;
  const shareLink = item => `https://play.google.com/store/${item.kind === 'apps' || item.kind === 'games' || !item.kind ? 'apps' : item.kind}/details?id=${packageName(item)}`;
  const developerEmail = item => `${slug(item.developer)}@example.com`;
  const isApp = item => item.kind === 'apps' || item.kind === 'games';
  const installedState = (item, ctx) => item.app ? 'installed' : ctx.installed.includes(item.id) ? 'installed' : ctx.downloading === item.id ? ctx.phase : '';
  const sec = kind => SECTIONS.find(s => s[0] === kind) || SECTIONS[0];
  // StarRatingBar (play common): five stars drawn in star_color over star_bg_color.
  const stars = (rating, cls = '') => `<span class="lpp-stars ${cls}" role="img" aria-label="${rating}"><i style="width:${Math.max(0, Math.min(100, rating / 5 * 100))}%"></i></span>`;
  const ICONS = {
    orbit: '<svg viewBox="0 0 48 48"><defs><radialGradient id="lp" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#d0631e"/></radialGradient></defs><rect x="2" y="2" width="44" height="44" rx="9" fill="#152049"/><circle cx="12" cy="12" r="1" fill="#fff"/><circle cx="37" cy="9" r="1.2" fill="#fff"/><circle cx="38" cy="36" r=".9" fill="#fff"/><circle cx="24" cy="24" r="10" fill="url(#lp)"/><ellipse cx="24" cy="24" rx="17" ry="5.5" fill="none" stroke="#9fd3ff" stroke-width="2.2" transform="rotate(-20 24 24)"/></svg>',
    blocks: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2b2b2b"/><g stroke="#0006" stroke-width="1"><rect x="8" y="26" width="10" height="10" fill="#ff5a4e"/><rect x="18" y="26" width="10" height="10" fill="#ffc533"/><rect x="28" y="26" width="10" height="10" fill="#45c1ff"/><rect x="18" y="16" width="10" height="10" fill="#7bd448"/><rect x="28" y="16" width="10" height="10" fill="#b36cff"/></g></svg>',
    golf: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#0c1022"/><circle cx="24" cy="40" r="20" fill="#b9bfd0"/><circle cx="17" cy="33" r="3" fill="#8e95aa"/><circle cx="31" cy="36" r="2" fill="#8e95aa"/><path d="M28 30V10l9 4-9 4" fill="#e04848" stroke="#ddd" stroke-width="1.2"/><circle cx="16" cy="24" r="2.4" fill="#fff"/></svg>',
    planner: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2a6fbd"/><rect x="10" y="12" width="28" height="26" rx="2" fill="#fff"/><rect x="10" y="12" width="28" height="7" rx="2" fill="#e8453c"/><g fill="#9aa7b5"><rect x="14" y="23" width="5" height="4"/><rect x="21" y="23" width="5" height="4"/><rect x="28" y="23" width="5" height="4"/><rect x="14" y="30" width="5" height="4"/><rect x="21" y="30" width="5" height="4"/></g><path d="M27 33l3 3 6-7" fill="none" stroke="#2fa84f" stroke-width="2.4"/></svg>'
  };
  const art = (item, cls = 'lpp-icon') => item.app ? `<img class="${cls}" src="assets/${item.app}.png" alt="">`
    : ICONS[item.art] ? `<i class="${cls} lpp-svg" aria-hidden="true">${ICONS[item.art]}</i>`
    : `<i class="${cls} lpp-cover ${item.kind || ''}" style="--a:${(item.colors || ['#2f4f6f', '#8fc0e8'])[0]};--b:${(item.colors || ['#2f4f6f', '#8fc0e8'])[1]}" aria-hidden="true"><b>${e((item.name || '?').slice(0, 1))}</b></i>`;
  const price = (item, ctx) => item.price === 'FREE' ? text(ctx.lang, 'Free') : item.price;
  const T = ctx => key => text(ctx.lang, key);
  // The status bar colour of the current page (status_bar_*; Settings is Theme.Material.Light.DarkActionBar's black).
  function statusColor(ctx) {
    if (ctx.page === 'settings') return '#000000';
    const item = ctx.page === 'detail' ? find(ctx.selected) : null;
    return sec(item ? item.kind : ctx.page === 'section' ? ctx.section : 'apps')[3];
  }

  // search_toolbar: 56 dp in the corpus colour; the drawer toggle on the drawer's top-level pages, the up arrow elsewhere.
  function toolbar(ctx, title, opts = {}) {
    const t = T(ctx), color = opts.color || sec('apps')[2];
    const nav = opts.drawer ? `<button class="lpp-nav burger" data-action="kkp-drawer" aria-label="${e(t('Show navigation drawer'))}"><i></i></button>` : `<button class="lpp-nav up" data-action="back" aria-label="${e(t('Navigate up'))}"></button>`;
    if (ctx.searching) return `<form class="lpp-bar searching" style="--c:${color}" data-form="jbp-search">${nav}<input name="query" autocomplete="off" aria-label="${e(t('Search Google Play'))}" placeholder="${e(t('Search Google Play'))}" value="${e(ctx.editValue || '')}"><button class="lpp-ab search" type="submit" aria-label="${e(t('Search Google Play'))}"></button></form>`;
    return `<div class="lpp-bar${opts.overlay ? ' overlay' : ''}" style="--c:${color}">${nav}<b>${e(title)}</b>${opts.noSearch ? '' : `<button class="lpp-ab search" data-action="jbp-search" aria-label="${e(t('Search Google Play'))}"></button>`}${opts.overflow ? `<button class="lpp-ab overflow" data-action="jbp-menu" aria-label="${e(t('More options'))}"></button>` : ''}</div>`;
  }
  function suggestions(ctx) {
    if (!ctx.searching) return '';
    const q = String(ctx.editValue || '').trim().toLocaleLowerCase(ctx.locale);
    const list = q ? all().filter(item => item.name.toLocaleLowerCase(ctx.locale).includes(q)).slice(0, 5).map(item => ({id: item.id, name: item.name})) : ctx.history.slice(0, 5).map(name => ({id: '', name}));
    return list.length ? `<div class="lpp-suggest">${list.map(s => `<button type="button" data-action="${s.id ? 'jbp-detail' : 'jbp-search-run'}" data-id="${e(s.id || s.name)}"><i class="${s.id ? 'item' : 'recent'}"></i><span>${e(s.name)}</span></button>`).join('')}</div>` : '';
  }
  const view = (ctx, cls, head, body) => `<div class="app-view jbp lpp ${cls}" data-no-translate>${head}<div class="jbp-scroll">${body}</div>${suggestions(ctx)}</div>`;
  // PlayHeaderListTabStrip: upper-case tab titles in the toolbar colour.
  const tabStrip = (ctx, color, tabs, current) => `<div class="jbp-tabs lpp-tabs${tabs.length < 3 ? ' few' : ''}" style="--c:${color}" data-jbp-swipe>${tabs.map(([id, label]) => `<button class="${id === current ? 'on' : ''}" data-action="jbp-tab" data-id="${e(id)}">${e(text(ctx.lang, label).toLocaleUpperCase(ctx.locale))}</button>`).join('')}</div>`;

  // play_card_small: the thumbnail, the title over two lines, the subtitle, the stars and the price label (an installed
  // item shows the corpus-coloured "Installed" label), the card overflow.
  function card(item, ctx) {
    const state = installedState(item, ctx), [, , color] = sec(item.kind);
    const label = state === 'installed' ? `<em class="ok" style="color:${color}">${e(text(ctx.lang, 'Installed'))}</em>` : `<em style="color:${color}">${e(price(item, ctx))}</em>`;
    return `<div class="lpp-card ${item.kind}"><button class="lpp-card-main" data-action="jbp-detail" data-id="${e(item.id)}">${art(item, 'lpp-card-art')}<span class="lpp-card-copy"><b>${e(item.name)}</b><small>${e(item.developer)}</small><span class="lpp-card-foot">${isApp(item) ? stars(item.rating) : '<span></span>'}${label}</span></span></button><button class="lpp-dots" data-action="jbp-card-menu" data-id="${e(item.id)}" aria-label="${e(text(ctx.lang, 'Options'))}"></button></div>`;
  }
  // play_card_cluster with its header: the title, the subtitle and the MORE box ("%d more" / "more", upper case).
  function cluster(title, sub, kind, items, ctx, target, tab) {
    const [, , color] = sec(kind), t = T(ctx), rest = items.length - 3;
    const more = rest > 0 && rest <= 99 ? fmt(t('%1$d more'), rest) : t('more');
    return `<section class="lpp-cluster"><button class="lpp-cluster-head" data-action="jbp-section" data-id="${e(target || kind)}"${tab ? ` data-tab="${e(tab)}"` : ''}><span><h3>${e(title)}</h3>${sub ? `<small>${e(sub)}</small>` : ''}</span><em style="background:${color}">${e(more.toLocaleUpperCase(ctx.locale))}</em></button><div class="lpp-cards">${items.filter(Boolean).slice(0, 3).map(item => card(item, ctx)).join('')}</div></section>`;
  }
  function home(ctx) {
    const t = T(ctx), items = all();
    const links = SECTIONS.map(([id, label, color]) => `<button class="lpp-link" style="--c:${color}" data-action="jbp-section" data-id="${id}">${e(t(label).toLocaleUpperCase(ctx.locale))}</button>`).join('');
    const apps = items.filter(isApp);
    return view(ctx, 'lpp-home', toolbar(ctx, t('Google Play'), {drawer: true}),
      `<div class="lpp-links">${links}</div>${cluster(t('New + Updated Games'), '', 'games', items.filter(i => i.kind === 'games'), ctx)}${cluster(t('Recommended for You'), t('Our favourite apps this week'), 'apps', apps, ctx, 'apps')}${cluster(t('Albums from $3.99'), t('Summer Demo Tapes'), 'music', items.filter(i => i.kind === 'music'), ctx)}${cluster(t('Free classics'), t('Timeless books, free'), 'books', items.filter(i => i.kind === 'books'), ctx)}`);
  }
  function section(ctx) {
    const t = T(ctx), [id, label, color] = sec(ctx.section), tabs = TABS[id], tab = tabs.includes(ctx.tab) ? ctx.tab : 'Home';
    const items = all().filter(item => item.kind === id);
    let body;
    if (tab === 'Categories' || tab === 'Genres') {
      const cats = {games: ['Action', 'Adventure', 'Arcade', 'Board', 'Card', 'Casual', 'Educational', 'Puzzle', 'Racing', 'Sports', 'Strategy'], apps: ['Books & Reference', 'Business', 'Comics', 'Communication', 'Education', 'Entertainment', 'Finance', 'Health & Fitness', 'Libraries & Demo', 'Lifestyle', 'Media & Video', 'Medical', 'Music & Audio', 'News & Magazines', 'Personalization', 'Photography', 'Productivity', 'Shopping', 'Social', 'Sports', 'Tools', 'Transportation', 'Travel & Local', 'Weather'], music: ['Alternative', 'Blues', 'Classical', 'Country', 'Electronica', 'Folk', 'Jazz', 'Pop', 'Rock', 'Soundtracks'], books: ['Biographies & Memoirs', 'Business & Investing', 'Children\'s Books', 'Fiction & Literature', 'History', 'Mystery & Thrillers', 'Science Fiction & Fantasy'], movies: ['Action & Adventure', 'Animation', 'Comedy', 'Documentary', 'Drama', 'Family', 'Horror'], magazines: ['Business & News', 'Food & Cooking', 'Outdoors', 'Technology']}[id];
      body = `<div class="lpp-catlist">${cats.map(c => `<button data-action="jbp-tab" data-id="${e(tabs[2])}">${e(c)}</button>`).join('')}</div>`;
    } else if (tab === 'Home') {
      const top = [...items].sort((a, b) => b.rating - a.rating);
      body = `${cluster(t('Staff Picks'), t('Our favourite apps this week'), id, top, ctx, id)}${top.length > 3 ? cluster(t('Recommended for You'), t(label), id, top.slice(3), ctx, id) : ''}`;
    } else {
      const sorted = [...items].sort((a, b) => tab === 'Trending' || tab === 'New Releases' ? a.name.localeCompare(b.name) : b.rating - a.rating).filter(item => tab.includes('Paid') || tab === 'Top Selling' ? item.price !== 'FREE' : tab.includes('Free') ? item.price === 'FREE' : true);
      body = sorted.length ? `<div class="lpp-list">${sorted.map(item => row(item, ctx)).join('')}</div>` : `<p class="lpp-empty">${e(fmt(t('No results found for "%1$s".'), t(tab)))}</p>`;
    }
    return view(ctx, `lpp-section ${id}`, toolbar(ctx, t(label), {color}) + tabStrip(ctx, color, tabs.map(x => [x, x]), tab), body);
  }
  // play_card_listing (96 dp): the thumbnail, title, subtitle, stars, the label at the bottom right, the overflow.
  function row(item, ctx, opts = {}) {
    const state = installedState(item, ctx), [, , color] = sec(item.kind);
    const label = state === 'installed' ? `<em class="ok" style="color:${color}">${e(text(ctx.lang, 'Installed'))}</em>` : opts.mine ? '' : `<em style="color:${color}">${e(price(item, ctx))}</em>`;
    const side = opts.archive ? `<button class="lpp-archive" data-action="jbp-archive" data-id="${e(item.id)}" aria-label="${e(text(ctx.lang, 'Remove'))}"></button>` : opts.mine ? '' : `<button class="lpp-dots" data-action="jbp-card-menu" data-id="${e(item.id)}" aria-label="${e(text(ctx.lang, 'Options'))}"></button>`;
    return `<div class="lpp-row"><button class="lpp-row-main" data-action="jbp-detail" data-id="${e(item.id)}">${art(item, 'lpp-row-art')}<span class="lpp-row-copy"><b>${e(item.name)}</b><small>${e(item.developer)}</small>${stars(item.rating)}</span>${label}</button>${side}</div>`;
  }
  const REVIEWS = [
    {author: 'Joseph', date: 'October 12, 2015', stars: 5, title: 'Love it', text: 'Exactly what I was looking for. Works great on my Nexus 6.'},
    {author: 'James', date: 'October 3, 2015', stars: 4, title: 'Faster', text: 'Faster than the last version. Love the new widget.'},
    {author: 'Maria', date: 'September 21, 2015', stars: 4, title: 'Simple', text: 'Simple and pretty. Does what it says.'}
  ];
  // ReviewsSamplesModule: HistogramView (the 56 sp Light average, stars and the reviewer count with ic_user_rating, the
  // 8 dp bars) and review_item rows (the 40 dp round avatar, the author, stars and date, the title and the text).
  function reviews(item, ctx) {
    const t = T(ctx), total = item.votes, shares = [.62, .2, .09, .04, .05].map((s, i) => Math.max(1, Math.round(total * (s + (item.rating - 4.4) * (i ? -.04 : .16)))));
    const max = Math.max(...shares), colors = ['#8bc34a', '#cddc39', '#ffeb3b', '#ffb74d', '#ff8a65'];
    return `<div class="lpp-module lpp-reviews"><div class="lpp-hist"><b class="lpp-avg">${item.rating.toLocaleString(ctx.locale, {minimumFractionDigits: 1})}</b><span class="lpp-avg-sub">${stars(item.rating)}<small><i class="lpp-user"></i>${total.toLocaleString(ctx.locale)}</small></span><span class="lpp-bars">${shares.map((n, i) => `<span><small>${5 - i}</small><i style="width:${Math.max(2, Math.round(n / max * 100))}%;background:${colors[i]}"></i></span>`).join('')}</span></div>${REVIEWS.map(r => `<div class="lpp-review"><i class="lpp-avatar"></i><div><b>${e(r.author)}</b><span class="lpp-review-by">${stars(r.stars)}<small>${e(r.date)}</small></span><strong>${e(r.title)}</strong><p>${e(r.text)}</p></div></div>`).join('')}<div class="lpp-all-reviews"><em style="color:${sec(item.kind)[2]}">${e(t('ALL REVIEWS'))}</em></div></div>`;
  }
  // The details page in DETAILS_MODULES order.
  function detail(ctx) {
    const t = T(ctx), item = find(ctx.selected);
    if (!item) return home(ctx);
    const state = installedState(item, ctx), owned = state === 'installed', [, label, color] = sec(item.kind), wished = (ctx.wishlist || []).includes(item.id);
    let buttons;
    if (owned) buttons = `<span class="lpp-btns"><button class="lpp-btn plain" data-action="jbp-uninstall-ask" data-id="${e(item.id)}"${item.app ? ' disabled' : ''}>${e(t('Uninstall').toLocaleUpperCase(ctx.locale))}</button><button class="lpp-btn" style="--c:${color}" data-action="jbp-open" data-id="${e(item.id)}">${e(t('Open').toLocaleUpperCase(ctx.locale))}</button></span>`;
    else if (state === 'downloading' || state === 'installing') {
      const mb = parseFloat(item.size) || 1, done = state === 'installing' ? mb : mb * ctx.progress;
      buttons = `<span class="lpp-dl"><span class="lpp-dl-text"><small>${e(state === 'installing' ? t('Installing…') : fmt('^1/^2', done.toFixed(1) + 'MB', mb.toFixed(1) + 'MB'))}</small><small>${state === 'installing' ? '' : e(fmt('^1%', Math.round(ctx.progress * 100)))}</small></span><i class="lpp-progress${state === 'installing' ? ' busy' : ''}" style="--c:${color}"><b style="width:${state === 'installing' ? 100 : Math.round(ctx.progress * 100)}%"></b></i><button class="lpp-dl-cancel" data-action="jbp-cancel" aria-label="${e(t('Cancel this download'))}"></button></span>`;
    } else buttons = `<span class="lpp-btns"><button class="lpp-btn" style="--c:${color}" data-action="jbp-buy" data-id="${e(item.id)}">${e((item.price === 'FREE' ? t('Install') : fmt(t('Buy %1$s'), item.price)).toLocaleUpperCase(ctx.locale))}</button></span>`;
    const hero = `<div class="lpp-hero" style="--a:${(item.colors || ['#263238', color])[0]};--b:${(item.colors || ['#263238', color])[1]}">${art(item, 'lpp-hero-art')}</div>`;
    const title = `<div class="lpp-module lpp-title">${art(item, 'lpp-title-art')}<div class="lpp-title-copy"><b>${e(item.name)}</b><small>${e(item.developer)}</small>${buttons}</div><button class="lpp-wish${wished ? ' on' : ''}" data-action="jbp-wish" data-id="${e(item.id)}" aria-label="${e(t(wished ? 'Remove from wishlist' : 'Include in wishlist'))}"></button></div>`;
    const millions = parseInt(String(item.downloads).replace(/\D/g, ''), 10) || 0, mag = millions >= 1e6 ? [String(millions / 1e6), 'MILLION'] : [String(millions / 1e3), 'THOUSAND'];
    const discovery = isApp(item) ? `<div class="lpp-module lpp-discovery"><span class="lpp-badge"><i class="dl"><b>${e(mag[0])}</b><em>${mag[1]}</em></i><small>${e(t('Downloads'))}</small></span><span class="lpp-badge"><i class="rate" style="background:${color}"><b>${item.rating.toLocaleString(ctx.locale, {minimumFractionDigits: 1})}</b>${stars(item.rating, 'white')}</i><small>${item.votes.toLocaleString(ctx.locale)} <i class="lpp-user"></i></small></span></div>` : '';
    const desc = `<div class="lpp-module lpp-desc">${owned && item.whatsnew ? `<div class="lpp-whatsnew"><h4 style="color:${color}">${e(t("What's new"))}</h4><p>${e(item.whatsnew)}</p></div>` : ''}<p class="lpp-callout${ctx.expanded ? ' expanded' : ''}">${e(item.description || '')}</p>${ctx.expanded ? (!owned && item.whatsnew ? `<div class="lpp-whatsnew lpp-longdesc"><h4 style="color:${color}">${e(t("What's new"))}</h4><p>${e(item.whatsnew)}</p></div>` : '') : `<button class="lpp-readmore" style="color:${color}" data-action="lpp-readmore">${e(t('READ MORE'))}</button>`}</div>`;
    const shots = isApp(item) ? `<div class="lpp-module lpp-shots">${[0, 1, 2].map(n => `<span class="lpp-shot n${n}" style="--a:${(item.colors || ['#2a3a4a', color])[0]};--b:${(item.colors || ['#2a3a4a', color])[1]}">${art(item, 'lpp-shot-art')}</span>`).join('')}</div>` : '';
    const rated = ctx.rated?.[item.id] || 0;
    const rate = owned ? `<div class="lpp-module lpp-rate"><small>${e(t(rated ? 'Your review' : 'Rate this app'))}</small><span class="lpp-rate-bar">${[1, 2, 3, 4, 5].map(n => `<button class="${n <= rated ? 'on' : ''}" style="--c:${color}" data-action="jbp-rate-dialog" data-id="${e(item.id)}" data-stars="${n}" aria-label="${n}"></button>`).join('')}</span></div>` : '';
    const plussed = ctx.plussed.includes(item.id);
    const secondary = `<div class="lpp-module lpp-secondary"><button data-action="jbp-wish" data-id="${e(item.id)}"><i class="wish${wished ? ' on' : ''}"></i><span>${e(t('Wishlist'))}</span></button><button data-action="jbp-share" data-id="${e(item.id)}"><i class="share"></i><span>${e(t('Share'))}</span></button><button data-action="jbp-plus" data-id="${e(item.id)}"><i class="plus${plussed ? ' on' : ''}">+${item.plus + (plussed ? 1 : 0)}</i><span>${e(t("+1'd this"))}</span></button></div>`;
    const similar = cluster(t('Similar'), '', item.kind, all().filter(x => x.kind === item.kind && x.id !== item.id), ctx, item.kind);
    const dev = isApp(item) ? `<div class="lpp-module lpp-bylines"><h4>${e(t('Developer'))}</h4><div>${[['website', 'Visit webpage'], ['email', 'Send email'], ['privacy', 'Privacy policy'], ['permission', 'Permission details']].map(([icon, key]) => `<button data-action="${icon === 'permission' ? 'kkp-perm-details' : icon === 'email' ? 'jbp-dev-email' : 'jbp-unavailable'}" data-id="${e(item.id)}"><i class="${icon}"></i><span>${e(t(key))}</span></button>`).join('')}</div></div>` : '';
    const flag = `<button class="lpp-module lpp-footer" data-action="jbp-unavailable">${e(t('Flag as inappropriate'))}</button>`;
    return view(ctx, 'lpp-detail', toolbar(ctx, '', {color, overlay: true, overflow: owned && !item.app}), `${hero}${title}${discovery}${desc}${shots}${rate}${reviews(item, ctx)}${secondary}${similar}${dev}${flag}`);
  }
  // My apps: INSTALLED / ALL in the apps colour; my_apps_section_header and play_card_myapps rows.
  function myApps(ctx) {
    const t = T(ctx), tab = ctx.tab === 'ALL' ? 'ALL' : 'INSTALLED', [, , color] = sec('apps');
    const installed = all().filter(item => installedState(item, ctx) === 'installed').sort((a, b) => a.name.localeCompare(b.name));
    const library = all().filter(isApp).filter(item => installedState(item, ctx) === 'installed' || ctx.everInstalled.includes(item.id)).sort((a, b) => a.name.localeCompare(b.name));
    const body = tab === 'ALL'
      ? `<div class="lpp-list">${library.map(item => row(item, ctx, {mine: true, archive: installedState(item, ctx) !== 'installed'})).join('')}</div>`
      : installed.length ? `<div class="lpp-group"><span>${e(t('Up to date'))}</span><b>${installed.length}</b></div><div class="lpp-list">${installed.map(item => row(item, ctx, {mine: true})).join('')}</div>` : `<p class="lpp-empty">${e(t('Apps and games installed from Google Play Store will appear here.'))}</p>`;
    return view(ctx, 'lpp-myapps', toolbar(ctx, t('My apps'), {color, drawer: true}) + tabStrip(ctx, color, [['INSTALLED', 'Installed '], ['ALL', 'All']], tab), body);
  }
  function wishlist(ctx) {
    const t = T(ctx), items = (ctx.wishlist || []).map(find).filter(Boolean);
    return view(ctx, 'lpp-wishlist', toolbar(ctx, t('My wishlist'), {color: sec('apps')[2], drawer: true}), items.length ? `<div class="lpp-list">${items.map(item => row(item, ctx)).join('')}</div>` : `<div class="lpp-wish-empty"><i></i><p>${e(t('There are no items in your wishlist. To add items, tap the bookmark whenever you see it in the menu above.'))}</p></div>`);
  }
  function search(ctx) {
    const q = String(ctx.query || '').trim(), lq = q.toLocaleLowerCase(ctx.locale), items = q ? all().filter(item => `${item.name} ${item.developer}`.toLocaleLowerCase(ctx.locale).includes(lq)) : [];
    return view(ctx, 'lpp-results', toolbar(ctx, q, {color: sec('apps')[2]}), items.length ? `<div class="lpp-list">${items.map(item => row(item, ctx)).join('')}</div>` : `<p class="lpp-empty">${e(fmt(text(ctx.lang, 'No results found for "%1$s".'), q))}</p>`);
  }
  const AUTH = [['always', 'For all purchases through Google Play on this device'], ['session', 'Every 30 minutes'], ['never', 'Never']];
  // res/xml/settings.xml on Theme.Material.Light.DarkActionBar (the #455A64 bar of SettingsActionBarStyle).
  function settings(ctx) {
    const t = T(ctx), s = ctx.prefs;
    const cat = title => `<h3 class="lpp-pref-cat">${e(t(title))}</h3>`;
    const chk = (key, title, summary) => `<button class="lpp-pref" data-action="jbp-pref" data-id="${key}" role="checkbox" aria-checked="${!!s[key]}"><span><b>${e(t(title))}</b><small>${e(t(summary))}</small></span><i class="lpp-check${s[key] ? ' on' : ''}"></i></button>`;
    const plain = (action, title, summary) => `<button class="lpp-pref" data-action="${action}"><span><b>${e(t(title))}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span></button>`;
    const auto = {never: 'Do not auto-update apps', any: 'Auto-update apps at any time. Data charges may apply.', wifi: 'Auto-update apps over Wi-Fi only'}[s.autoMode || 'wifi'];
    const auth = (AUTH.find(([id]) => id === (s.auth || 'session')) || AUTH[1])[1];
    return `<div class="app-view jbp lpp lpp-settings" data-no-translate>${toolbar({...ctx, searching: false}, t('Settings'), {color: '#455A64', noSearch: true})}<div class="jbp-scroll">${cat('General')}${chk('notify', 'Notifications', 'Notify me about updates to apps or games that I downloaded')}${plain('jbp-auto-update', 'Auto-update apps', t(auto))}${chk('shortcuts', 'Add icon to Home screen', 'For new apps')}${plain('jbp-clear-history', 'Clear local search history', t('Remove searches you have performed from this device'))}${cat('User controls')}${plain('jbp-content-filter', 'Content filtering', t('Set the content filtering level to restrict apps that can be downloaded'))}${plain('lpp-auth', 'Require authentication', t(auth))}${cat('About')}${plain('jbp-unavailable', 'Open source licenses', t('License details for open source software'))}${plain('jbp-noop', 'Build version', fmt(t('Version: %1$s'), VERSION))}</div></div>`;
  }
  // AppsPermissionsActivity: the 50 dp icon and the app's name, "<b>app</b> needs access to", the buckets with their
  // ic_perm_* icons (each opens to its permissions), the button bar with the Play logo and ACCEPT, the footer note.
  const BUCKETS = {media: ['Photos/Media/Files', 'modify or delete the contents of your USB storage'], wifi: ['Wi-Fi connection information', 'view Wi-Fi connections'], other: ['Other', 'full network access']};
  function permissions(item, ctx) {
    const t = T(ctx), [, , color] = sec(item.kind), open = ctx.permOpen || '';
    const ids = item.kind === 'games' ? ['media', 'other'] : ['media', 'wifi'];
    const accept = ctx.permView ? `<button class="lpp-btn" style="--c:${color}" data-action="close-overlay">${e(t('OK').toLocaleUpperCase(ctx.locale))}</button>` : `<button class="lpp-btn" style="--c:${color}" data-action="jbp-accept" data-id="${e(item.id)}">${e(t('Accept').toLocaleUpperCase(ctx.locale))}</button>`;
    return `<div class="jbp-dlg-scrim" data-action="close-overlay"></div><div class="lpp-perms" role="dialog" aria-label="${e(t('App permissions'))}"><div class="lpp-perms-head">${art(item, 'lpp-perms-art')}<b>${e(item.name)}</b></div><div class="lpp-perms-list"><p>${fmt(e(t('%1$s needs access to')).replace(/&lt;(\/?)b&gt;/g, '<$1b>'), e(item.name))}</p>${ids.map(id => `<button class="lpp-perm${open === id ? ' open' : ''}" data-action="kkp-perm" data-id="${id}" aria-expanded="${open === id}"><i class="lpp-perm-icon ${id}"></i><span>${e(t(BUCKETS[id][0]))}</span><i class="lpp-chev"></i></button>${open === id ? `<p class="lpp-perm-detail">${e(BUCKETS[id][1])}</p>` : ''}`).join('')}</div><div class="lpp-perms-bar"><i class="lpp-gplay"></i>${accept}</div><p class="lpp-perms-foot">${e(fmt(t('Updates to %1$s may automatically add additional capabilities within each group. Learn more'), item.name).replace(/<[^>]*>/g, ''))}</p></div>`;
  }
  function render(ctx) {
    if (ctx.page === 'section') return section(ctx);
    if (ctx.page === 'detail') return detail(ctx);
    if (ctx.page === 'my-apps') return myApps(ctx);
    if (ctx.page === 'wishlist') return wishlist(ctx);
    if (ctx.page === 'search') return search(ctx);
    if (ctx.page === 'settings') return settings(ctx);
    return home(ctx);
  }
  // menu/actions.xml: only the checkable Auto-update item reaches the overflow, on an installed app's details.
  function menu(ctx) {
    const item = ctx.page === 'detail' ? find(ctx.selected) : null;
    return item && installedState(item, ctx) === 'installed' && !item.app ? [{action: 'lpp-auto-item', title: text(ctx.lang, 'Auto-update'), checked: (ctx.autoUpdate || []).includes(item.id)}] : [];
  }
  // The side drawer: play_drawer_profile_info, the primary actions with their icons, the separator, the secondary ones.
  function drawer(ctx) {
    const t = T(ctx), cur = ctx.page === 'my-apps' ? 'myapps' : ctx.page === 'wishlist' ? 'wishlist' : ctx.page === 'home' ? 'home' : '';
    const primary = (icon, action, label) => `<button class="lpp-nav-item${cur === icon ? ' on' : ''}" data-action="${action}"><i class="${icon}"></i>${e(t(label))}</button>`;
    const secondary = (action, label) => `<button class="lpp-nav-item small" data-action="${action}">${e(t(label))}</button>`;
    return `<div class="lpp-drawer-scrim" data-action="close-overlay"></div><nav class="lpp-drawer" aria-label="${e(t('Google Play'))}"><div class="lpp-profile"><i class="lpp-profile-avatar"></i><span><b>${e(ctx.userName || 'Android Demo')}</b><small>${e(ctx.account || 'demo@android.local')}</small></span></div><div class="lpp-nav-list">${primary('home', 'kkp-home', 'Store home')}${primary('myapps', 'jbp-my-apps', 'My apps')}${primary('wishlist', 'jbp-wishlist', 'My wishlist')}${primary('people', 'jbp-unavailable', 'People')}${primary('myaccount', 'jbp-unavailable', 'My account')}<hr>${secondary('jbp-unavailable', 'Redeem')}${secondary('jbp-settings', 'Settings')}${secondary('jbp-unavailable', 'Help & Feedback')}</div></nav>`;
  }
  const dialogBox = (cls, label, body, buttons) => `<div class="jbp-dlg-scrim" data-action="close-overlay"></div><div class="lpp-dlg ${cls}" role="dialog" aria-label="${e(label)}">${label ? `<h3>${e(label)}</h3>` : ''}${body}${buttons ? `<div class="lpp-dlg-buttons">${buttons}</div>` : ''}</div>`;
  function dialog(kind, ctx) {
    const t = T(ctx), item = find(ctx.target || ctx.selected);
    if (kind === 'drawer') return drawer(ctx);
    if (kind === 'card' && item) {
      const wished = (ctx.wishlist || []).includes(item.id), state = installedState(item, ctx);
      const buy = state === 'installed' ? '' : `<button data-action="jbp-buy" data-id="${e(item.id)}">${e(item.price === 'FREE' ? t('Install') : fmt(t('Buy %1$s'), item.price))}</button>`;
      return `<div class="jbp-pop-scrim" data-action="close-overlay"></div><div class="lpp-pop" style="top:${ctx.popTop || 120}px" role="menu"><button data-action="jbp-wish" data-id="${e(item.id)}">${e(t(wished ? 'Remove from wishlist ' : 'Add to wishlist'))}</button>${buy}</div>`;
    }
    if (kind === 'perms' && item) return permissions(item, ctx);
    const radios = (rows, current, action) => rows.map(([id, label]) => `<button class="lpp-dlg-row" data-action="${action}" data-id="${id}" role="radio" aria-checked="${current === id}"><i class="lpp-radio${current === id ? ' on' : ''}"></i><span>${e(t(label))}</span></button>`).join('');
    if (kind === 'auto') return dialogBox('list', t('Auto-update apps'), radios([['never', 'Do not auto-update apps'], ['any', 'Auto-update apps at any time. Data charges may apply.'], ['wifi', 'Auto-update apps over Wi-Fi only']], ctx.prefs.autoMode || 'wifi', 'jbp-auto-pick'), `<button data-action="close-overlay">${e(t('Cancel').toLocaleUpperCase(ctx.locale))}</button>`);
    if (kind === 'auth') return dialogBox('list', t('Require authentication'), radios(AUTH, ctx.prefs.auth || 'session', 'lpp-auth-pick'), `<button data-action="close-overlay">${e(t('Cancel').toLocaleUpperCase(ctx.locale))}</button>`);
    if (kind === 'rate' && item) {
      // RateReviewActivity: the stars, the rating's name ("Tap on the stars" … "Loved it"), Title and Description.
      const r = ctx.rateDraft ?? ctx.rated?.[item.id] ?? 0, names = ['Tap on the stars', 'Hated it', 'Disliked it', "It's OK", 'Liked it', 'Loved it'];
      return dialogBox('rate', t('Rate it!'), `<div class="lpp-rate-set">${[1, 2, 3, 4, 5].map(n => `<button class="${n <= r ? 'on' : ''}" style="--c:${sec(item.kind)[2]}" data-action="jbp-rate-pick" data-id="${n}" aria-label="${n}"></button>`).join('')}</div><p class="lpp-rate-name">${e(t(names[r]))}</p><input class="lpp-field" placeholder="${e(t('Title'))}" aria-label="${e(t('Title'))}"><textarea class="lpp-field" rows="3" maxlength="512" placeholder="${e(t('Description'))}" aria-label="${e(t('Description'))}"></textarea>`, `<button data-action="close-overlay">${e(t('Cancel').toLocaleUpperCase(ctx.locale))}</button><button data-action="jbp-rate-ok" data-id="${e(item.id)}"${r ? '' : ' disabled'}>${e(t('OK').toLocaleUpperCase(ctx.locale))}</button>`);
    }
    if (kind === 'uninstall' && item) return dialogBox('ask', '', `<p>${e(t('Do you want to uninstall this app?'))}</p>`, `<button data-action="close-overlay">${e(t('Cancel').toLocaleUpperCase(ctx.locale))}</button><button data-action="jbp-uninstall" data-id="${e(item.id)}">${e(t('OK').toLocaleUpperCase(ctx.locale))}</button>`);
    if (kind === 'share' && item) return dialogBox('list', fmt(t('Share "%1$s" via'), item.name), SHARE_TARGETS.map(([app, name]) => `<button class="lpp-dlg-row" data-action="jbp-share-to" data-id="${app}|${e(item.id)}"><img class="jbp-share-icon" src="assets/${app}.png" alt=""><span>${e(ctx.t?.(name) || name)}</span></button>`).join(''));
    if (kind === 'filter') {
      const levels = ['Everyone', 'Low maturity', 'Medium maturity', 'High maturity', 'Show all apps'], f = ctx.filterDraft || ctx.prefs.filter || levels;
      return dialogBox('filter', t('Allow apps rated for'), `${levels.map(level => `<button class="lpp-dlg-row" data-action="jbp-filter-pick" data-id="${e(level)}" role="checkbox" aria-checked="${f.includes(level)}"><i class="lpp-check${f.includes(level) ? ' on' : ''}"></i><span>${e(t(level))}</span></button>`).join('')}<p class="lpp-dlg-note">${e(t('Set the content filtering level to restrict apps that can be downloaded to this device.'))}</p>`, `<button data-action="close-overlay">${e(t('Cancel').toLocaleUpperCase(ctx.locale))}</button><button data-action="jbp-filter-ok">${e(t('OK').toLocaleUpperCase(ctx.locale))}</button>`);
    }
    return '';
  }
  window.JBPlay = {SECTIONS, TABS, EXTRA, VERSION, text, fmt, all, find, packageName, shareLink, developerEmail, installedState, render, menu, dialog, drawer, statusColor, art};
})();
