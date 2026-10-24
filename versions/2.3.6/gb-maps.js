/* Google Maps 5.4.0 of the Nexus S image (GRK39F) and its launcher entries Places, Latitude and Navigation, from Maps.apk:
   - Maps: header_bar.xml (45 dip on header_bar_background: the "Search Maps" field with magnifying_glass_grey, then
     btn_show_places, btn_show_layers and btn_show_myl, 44 dip each, split by header_divider_line), the map with the
     blue location dot, btn_zoom_down / btn_zoom_up at the bottom (shown while the map is touched), search results as
     lettered markers (search_markers, letters) with the popup_pointer_button bubble, place pages, the directions panel
     (directions_input_dialog.xml on bottombar_portrait_565 with the mode_* toggles) and the layers list.
   - Places: the GmmGridView of icon_restaurants / coffee / bars / hotels / attractions / atms / gas / add with captions,
     and list_item_search_result rows.
   - Latitude: list_header_friends_list.xml (title, check in, add friends, refresh) and friends_list_item.xml (60 dip
     picture, name, 12 sp time, location).
   - Navigation: da_destination_activity.xml (52 dip da_action_bar_background with route options and Map; Speak / Type
     Destination, Contacts, Starred Places and Recent Destinations), and da_navigation.xml (the 84 dip
     da_top_panel_green step bar with da_turn_square_green_bg, the tilted map with dav_chevron, the 50 dip
     da_bottom_panel_gray status bar with the traffic dot, time remaining and road).
   Google's map tiles cannot ship, so the map is the drawn city of the Maps live wallpaper (LiveWallpapers.mapSheet); the
   places, friends and routes are made up. Maps 5.4 takes most of its interface text from a downloaded language pack
   that is not in the image; those rows fall back to the simulator's own translations. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const {e} = GBApps;
  const STRINGS = {
    "Maps": {"res": "Maps:MAPS_APP_NAME", "hu": "Maps", "de": "Maps", "fr": "Maps", "es": "Maps"},
    "Search Maps": {"res": "Maps:da_search_maps", "hu": "Keresés a térképen", "de": "Maps-Suche", "fr": "Rechercher sur Google Maps", "es": "Buscar en Maps"},
    "Latitude": {"res": "Maps:LATITUDE_APP_NAME", "hu": "Latitude", "de": "Latitude", "fr": "Latitude", "es": "Latitude"},
    "Places": {"res": "Maps:PLACES_APP_NAME", "hu": "Places", "de": "Places", "fr": "Adresses", "es": "Sitios"},
    "Navigation": {"res": "Maps:da_navigation", "hu": "Navigáció", "de": "Navigation", "fr": "Navigation", "es": "Navigation"},
    "Layers": {"res": "Maps:da_layers", "hu": "Rétegek", "de": "Ebenen", "fr": "Afficher...", "es": "Capas"},
    "Clear Map": {"res": "Maps:da_clear_layers", "hu": "Találatok törlése", "de": "Karte leeren", "fr": "Effacer les résultats", "es": "Borrar resultados"},
    "Starred Places": {"res": "Maps:da_picker_starred_items", "hu": "Csillaggal megjelölt helyek", "de": "Markierte Orte", "fr": "Adresses enregistrées", "es": "Sitios destacados"},
    "Traffic": {"res": "Maps:da_traffic", "hu": "Forgalom", "de": "Verkehr", "fr": "Infos trafic", "es": "Tráfico"},
    "Satellite": {"res": "Maps:da_satellite", "hu": "Műhold", "de": "Satellit", "fr": "Satellite", "es": "Satélite"},
    "Terrain": {"res": "Maps:WALLPAPER_MAP_MODE_TERRAIN", "hu": "Terrain", "de": "Gelände", "fr": "Relief", "es": "Relieve"},
    "Map": {"res": "Maps:da_map", "hu": "Térkép", "de": "Karte", "fr": "Plan", "es": "Mapa"},
    "Show Map": {"res": "Maps:da_show_map", "hu": "Térkép megjelenítése", "de": "Karte anzeigen", "fr": "Afficher plan", "es": "Ver mapa"},
    "Restaurants": {"res": "Maps:da_layer_name_restaurants", "hu": "Éttermek", "de": "Restaurants", "fr": "Restaurants", "es": "Restaurantes"},
    "Attractions": {"res": "Maps:da_layer_name_attractions", "hu": "Látnivalók", "de": "Attraktionen", "fr": "Attractions", "es": "Lugares de interés"},
    "Gas Stations": {"res": "Maps:da_layer_name_gas_stations", "hu": "Benzinkutak", "de": "Tankstellen", "fr": "Stations-service", "es": "Gasolineras"},
    "ATMs & Banks": {"res": "Maps:da_layer_name_atms_and_banks", "hu": "ATM-ek és bankok", "de": "Geldautomaten/Bankfilialen", "fr": "Distributeurs automatiques et banques", "es": "Bancos y cajeros automáticos"},
    "Walking": {"res": "Maps:da_walking", "hu": "Gyalog", "de": "Fußweg", "fr": "À pied", "es": "A pie"},
    "Driving": {"res": "Maps:da_driving", "hu": "Autóval", "de": "Auto", "fr": "Voiture", "es": "En coche"},
    "Go": {"res": "Maps:da_dialog_go", "hu": "Mehet", "de": "Los", "fr": "OK", "es": "Ir"},
    "Get Directions": {"res": "Maps:da_dialog_get_directions", "hu": "Útvonaltervezés", "de": "Route berechnen", "fr": "Calculer itinéraire", "es": "Cómo llegar"},
    "Speak Destination": {"res": "Maps:da_picker_speak_destination", "hu": "Cél kimondása", "de": "Ziel einsprechen", "fr": "Énoncer destination", "es": "Di el destino"},
    "Type Destination": {"res": "Maps:da_picker_type_destination", "hu": "Cél begépelése", "de": "Ziel eintippen", "fr": "Saisir destination", "es": "Teclear destino"},
    "Contacts": {"res": "Maps:da_picker_contacts", "hu": "Kapcsolatok", "de": "Kontakte", "fr": "Contacts", "es": "Contactos"},
    "Recent Destinations": {"res": "Maps:da_picker_recent_destinations", "hu": "Legutóbbi úti célok", "de": "Zuletzt eingegebene Ziele", "fr": "Destinations récentes", "es": "Destinos recientes"},
    "Destination": {"res": "Maps:da_picker_search_hint", "hu": "Cél", "de": "Ziel", "fr": "Destination", "es": "Destino"},
    "Route Info": {"res": "Maps:da_route_overview", "hu": "Útvonalinfó", "de": "Routeninformationen", "fr": "Infos sur l'itinéraire", "es": "Información de ruta"},
    "Directions List": {"res": "Maps:da_show_list", "hu": "Útvonalterv-lista", "de": "Routenliste", "fr": "Itinéraire", "es": "Ruta"},
    "Exit Navigation": {"res": "Maps:da_exit_navigation", "hu": "Kilépés a Navigációból", "de": "Navigation beenden", "fr": "Quitter la navigation", "es": "Salir de Navigation"},
    "Exit navigation?": {"res": "Maps:da_confirm_exit_title", "hu": "Kilép a navigációból?", "de": "Navigation beenden?", "fr": "Quitter le mode Navigation ?", "es": "¿Salir de la navegación?"},
    "This will end all route guidance.": {"res": "Maps:da_confirm_exit_text", "hu": "Ezzel leállítja az útvonalsegédletet.", "de": "Hierdurch wird die Routenführung beendet.", "fr": "Vous n'allez plus être guidé.", "es": "Se terminarán las indicaciones de rutas."},
    "Mute": {"res": "Maps:da_mute", "hu": "Elnémítás", "de": "Ton aus", "fr": "Silencieux", "es": "Silencio"},
    "Unmute": {"res": "Maps:da_unmute", "hu": "Hang visszakapcsolása", "de": "Ton ein", "fr": "Vocal", "es": "Reactivar audio"},
    "Settings": {"res": "Maps:da_settings", "hu": "Beállítások", "de": "Einstellungen", "fr": "Paramètres", "es": "Configuración"},
    "Help": {"res": "Maps:da_help", "hu": "Súgó", "de": "Hilfe", "fr": "Aide", "es": "Ayuda"},
    "Search": {"res": "Maps:da_search_label", "hu": "Keresés", "de": "Suchen", "fr": "Rechercher", "es": "Buscar"},
    "Terms, Privacy & Notices": {"res": "Maps:da_terms_privacy_notices", "hu": "Szerződési feltételek, adatvédelem és jogi közlemények", "de": "Nutzungsbedingungen", "fr": "Conditions et confidentialité", "es": "Términos y Privacidad"},
    "Turn left onto %1$s": {"res": "Maps:da_step_turn_left_onto", "hu": "Forduljon balra erre: %1$s", "de": "Links auf %1$s abbiegen", "fr": "Prendre à gauche sur %1$s", "es": "Gira a la izquierda hacia %1$s."},
    "Turn right onto %1$s": {"res": "Maps:da_step_turn_right_onto", "hu": "Forduljon jobbra erre: %1$s", "de": "Rechts auf %1$s abbiegen", "fr": "Prendre %1$s complètement à droite", "es": "Gira a la derecha hacia %1$s."},
    "Head %1$s on %2$s": {"res": "Maps:da_step_depart_on", "hu": "Menjen %1$si irányba a(z) %2$s úton", "de": "Richtung %1$s auf %2$s fahren", "fr": "Suivre la direction %1$s sur %2$s", "es": "Dirección %1$s por %2$s"},
    "Continue onto %1$s": {"res": "Maps:da_step_continue_onto", "hu": "Tovább erre: %1$s", "de": "Weiter auf %1$s", "fr": "Continuer sur %1$s", "es": "Continúa por %1$s."},
    "You have arrived.": {"res": "Maps:da_destination_reached", "hu": "Megérkezett.", "de": "Sie haben das Ziel erreicht.", "fr": "Vous êtes arrivé.", "es": "Has llegado."},
    "Your destination is on the right.": {"res": "Maps:da_destination_on_the_right", "hu": "Az úti cél a jobb oldalon található.", "de": "Das Ziel befindet sich auf der rechten Seite.", "fr": "Votre destination se trouve sur la droite.", "es": "Tu destino está a la derecha."},
    "%1$s min": {"res": "Maps:da_time_format_minutes", "hu": "%1$s perc", "de": "%1$s Min.", "fr": "%1$s mn", "es": "%1$s min"},
    "%1$s hr  %2$s min": {"res": "Maps:da_time_format_hours", "hu": "%1$s óra %2$s perc", "de": "%1$s h %2$s min", "fr": "%1$s h %2$s mn", "es": "%1$s h %2$s min"},
    "{0} km": {"res": "Maps:da_distance_format_kilometers_abbreviated", "hu": "{0} km", "de": "{0} km", "fr": "{0} km", "es": "{0} km"},
    "{0} m": {"res": "Maps:da_distance_format_meters_abbreviated", "hu": "{0} m", "de": "{0} m", "fr": "{0} m", "es": "{0} m"},
    "{0} mi": {"res": "Maps:da_distance_format_miles_abbreviated", "hu": "{0} mf", "de": "{0} mi", "fr": "{0} mi", "es": "{0} mi"},
    "{0} ft": {"res": "Maps:da_distance_format_feet_abbreviated", "hu": "{0} láb", "de": "{0} ft", "fr": "{0} pieds", "es": "{0} pie(s)"},
    "imperial": {"res": "Maps:da_distance_format_mode", "hu": "metric", "de": "metric", "fr": "metric", "es": "metric"},
    "north": {"res": "Maps:da_direction_north", "hu": "észak", "de": "Norden", "fr": "nord", "es": "norte"},
    "east": {"res": "Maps:da_direction_east", "hu": "kelet", "de": "Osten", "fr": "est", "es": "este"},
    "south": {"res": "Maps:da_direction_south", "hu": "dél", "de": "Süden", "fr": "sud", "es": "sur"},
    "west": {"res": "Maps:da_direction_west", "hu": "nyugat", "de": "Westen", "fr": "ouest", "es": "oeste"},
    "Getting driving directions": {"res": "Maps:da_waiting_for_directions", "hu": "Útvonaltervek beolvasása", "de": "Routenplaner wird abgerufen.", "fr": "Calcul de l'itinéraire routier", "es": "Obteniendo ruta en coche"},
    "Navigate to": {"res": "Maps:da_navigate_to", "hu": "Navigálás ide:", "de": "Navigiere zu", "fr": "Atteindre", "es": "Ir a"},
    "Cancel": {"res": "Maps:da_dialog_cancel", "hu": "Mégse", "de": "Abbrechen", "fr": "Annuler", "es": "Cancelar"},
    "OK": {"res": "Maps:da_dialog_ok", "hu": "OK", "de": "OK", "fr": "OK", "es": "Aceptar"},
    "Report a Problem": {"res": "Maps:da_report_a_problem", "hu": "Hibabejelentés", "de": "Ein Problem melden", "fr": "Signaler problème", "es": "Informar incidencia"},
    "Voice guidance": {"res": "Maps:da_voice_guidance", "hu": "Hangos irányítás", "de": "Sprachführung", "fr": "Assistant vocal", "es": "Indicaciones de voz"},
    "Choose Destination": {"res": "Maps:da_picker_choose_destination", "hu": "Úti cél kiválasztása", "de": "Ziel auswählen", "fr": "Choisir destination", "es": "Elegir destino"},
    "Route options": {"res": "Maps:da_route_options", "hu": "Útvonalopciók", "de": "Routenoptionen", "fr": "Options itinéraire", "es": "Opciones ruta"},
    "Avoid tolls": {"res": "Maps:da_avoid_tolls", "hu": "Útdíjak kikerülése", "de": "Mautpflichtige Straßen meiden", "fr": "Éviter les péages", "es": "Evitar peajes"},
    "Avoiding highways": {"res": "Maps:da_avoiding_highways", "hu": "Autópályák kikerülése", "de": "Ohne Autobahn", "fr": "Itinéraire sans autoroutes", "es": "Sin autopistas"},
    "Avoiding tolls": {"res": "Maps:da_avoiding_tolls", "hu": "Útdíjak kikerülése", "de": "Ohne Mautpflicht", "fr": "Itinéraire sans péages", "es": "Sin peajes"},
    "1-click report a problem": {"res": "Maps:da_one_button_map_issue_reporting", "hu": "Hibabejelentés egyetlen kattintással", "de": "Problem direkt melden", "fr": "Signaler un problème en un seul clic", "es": "Clic informar incidencia"}
  };
  // Navigation's route options offer highways and tolls; the image only has "Avoid tolls" for the check box, so the
  // highways one is Maps 7.5's DIRECTIONS_OPTIONS_AVOID_HIGHWAYS (Nexus 5 image) in the same languages.
  STRINGS['Avoid highways'] = {res: 'Maps:DIRECTIONS_OPTIONS_AVOID_HIGHWAYS', hu: 'Autópályák elkerülése', de: 'Autobahnen vermeiden', fr: 'Éviter les autoroutes', es: 'Evitar autopistas'};
  const T = GBApps.texts(STRINGS);
  const APPS = ['maps', 'places', 'latitude', 'navigation'];
  const A = name => `assets/mp-${name}.png`;
  const ME = {fx: .5, fy: .52};
  // Places of the drawn city: [id, name, category, address, fx, fy, rating, phone].
  const POIS = [
    ['p1', 'Riverside Grill', 'restaurants', '14 River St', .55, .44, 4.5, '202-555-0131'], ['p2', 'Luigi’s Trattoria', 'restaurants', '220 Market St', .43, .58, 4, '202-555-0175'],
    ['p3', 'Golden Lotus', 'restaurants', '8 Park Ave', .6, .62, 3.5, '202-555-0190'], ['p4', 'Bean There Café', 'coffee', '31 Market St', .47, .49, 4.5, '202-555-0102'],
    ['p5', 'Morning Grind', 'coffee', '5 Bridge Rd', .53, .57, 4, '202-555-0143'], ['p6', 'The Anchor Pub', 'bars', '77 Harbor Rd', .62, .48, 4, '202-555-0155'],
    ['p7', 'Blue Note Lounge', 'bars', '19 Elm St', .41, .45, 3.5, '202-555-0168'], ['p8', 'Harbor View Hotel', 'hotels', '1 Harbor Rd', .64, .41, 4, '202-555-0111'],
    ['p9', 'Parkside Inn', 'hotels', '60 Park Ave', .37, .63, 3.5, '202-555-0124'], ['p10', 'City Museum', 'attractions', '2 Museum Sq', .46, .36, 4.5, '202-555-0109'],
    ['p11', 'Old Town Bridge', 'attractions', 'River St', .56, .26, 5, ''], ['p12', 'Riverside Park', 'attractions', 'Park Ave', .32, .66, 4.5, ''],
    ['p13', 'First City Bank', 'atms', '100 Market St', .49, .55, 3, '202-555-0181'], ['p14', 'Central Savings ATM', 'atms', '9 Elm St', .44, .5, 3, ''],
    ['p15', 'Northside Fuel', 'gas', '400 Ring Rd', .38, .3, 3.5, '202-555-0162'], ['p16', 'Ring Road Gas', 'gas', '18 Ring Rd', .7, .7, 3, '202-555-0198']
  ].map(([id, name, cat, address, fx, fy, rating, phone]) => ({id, name, cat, address, fx, fy, rating, phone}));
  const CATS = [['restaurants', 'Restaurants'], ['coffee', 'Coffee'], ['bars', 'Bars'], ['hotels', 'Hotels'], ['attractions', 'Attractions'], ['atms', 'ATMs'], ['gas', 'Gas Stations']];
  const WORDS = {restaurants: /restaurant|food|eat|pizza|grill|dinner|lunch|étterem|essen|restaurant/i, coffee: /coffee|caf|kávé|kaffee/i, bars: /bar|pub|drink|kocsma/i, hotels: /hotel|inn|szálló|szállás/i, attractions: /museum|park|bridge|sight|attraction|múzeum|látnivaló/i, atms: /atm|bank/i, gas: /gas|fuel|benzin|tank/i};
  const FRIENDS = [
    {id: 'f1', name: 'Alex Morgan', place: 'Riverside Park', fx: .33, fy: .64, minutes: 4}, {id: 'f2', name: 'Sam Rivera', place: 'Market St', fx: .45, fy: .56, minutes: 12},
    {id: 'f3', name: 'Taylor Lee', place: 'Harbor Rd', fx: .63, fy: .46, minutes: 38}, {id: 'f4', name: 'Mom', place: 'Elm St', fx: .42, fy: .43, minutes: 95}
  ];
  const STREETS = ['River St', 'Market St', 'Park Ave', 'Elm St', 'Harbor Rd', 'Ring Rd', 'Bridge Rd'];
  // Distance on the drawn city, which spans four kilometres across its two screens.
  const km = (a, b) => Math.hypot((a.fx - b.fx) * 4, (a.fy - b.fy) * 3);
  function distance(lang, value) {
    if (T(lang, 'imperial') === 'imperial') { const mi = value * .621; return mi < .1 ? T(lang, '{0} ft').replace('{0}', Math.round(mi * 5280 / 50) * 50) : T(lang, '{0} mi').replace('{0}', mi.toFixed(1)); }
    return value < 1 ? T(lang, '{0} m').replace('{0}', Math.round(value * 1000 / 10) * 10) : T(lang, '{0} km').replace('{0}', value.toFixed(1));
  }
  const minutes = (lang, m) => m >= 60 ? AndroidStrings.format(T(lang, '%1$s hr  %2$s min'), Math.floor(m / 60), m % 60) : AndroidStrings.format(T(lang, '%1$s min'), Math.max(1, m));
  const stars = r => Array.from({length: 5}, (_, i) => `<img src="${A(i < Math.round(r) ? 'hotpot_small_star_on' : 'hotpot_small_star_off')}" alt="">`).join('');
  const poi = id => POIS.find(p => p.id === id);
  /* The layers that came from Google's server (LAYERS_REQUEST: Transit Lines, Bicycling, Wikipedia) are drawn over the
     city like 2.1's: two transit lines along the avenues with their stops, bike paths (dark green: trails along the river
     and through the parks; dashed: bike-friendly avenues) and Wikipedia's "W" pins on the articles' places. */
  const riverFx = fy => .56 + Math.sin(fy * Math.PI * 1.4 + .6) * .05;
  const TRANSIT = [
    {color: '#2a63c8', stops: [[.02, .298], [.14, .286], [.3, .27], [.45, .263], [riverFx(.26), .26], [.7, .238], [.86, .218], [.98, .203]]},
    {color: '#2c9b48', stops: [[.205, .04], [.215, .16], [.228, .3], [.24, .5], [.222, .66], [.2, .82], [.185, .96]]}
  ];
  const BIKE = {trails: [Array.from({length: 21}, (_, i) => [riverFx(i / 20) - .035, i / 20]), [[.13, .2], [.2, .24], [.27, .21]], [[.31, .64], [.35, .7], [.39, .76]], [[.87, .72], [.91, .78], [.95, .83]]],
    lanes: [[[0, .74], [.4, .7], [riverFx(.68), .68], [1, .62]]]};
  const WIKI = [
    {id: 'w1', name: 'City Museum', article: 'Museum', fx: .465, fy: .345}, {id: 'w2', name: 'Old Town Bridge', article: 'Arch_bridge', fx: .575, fy: .255},
    {id: 'w3', name: 'Riverside Park', article: 'Urban_park', fx: .345, fy: .7}, {id: 'w4', name: 'Harbor District', article: 'Harbor', fx: .655, fy: .4}
  ];
  // Maps' Labs (data.appPrefs['maps-labs']) as the last map view saw them; the map draws the scale bar and measure lines.
  let labs = {}, currentLang = 'en';
  const state = ui => (ui.mp ||= {cx: .5, cy: .52, z: 1.5, mode: 'normal', traffic: false, results: [], query: '', selected: '', page: '', route: null, zoomShown: false});

  // ---------- The map (canvas + positioned markers) ----------
  let sheet = null, sheetKey = '', drag = null, zoomTimer = 0, currentUI = null;
  // 1 dp in CSS px: the display is 320 dp wide (276 px in the desktop frame, the whole width on a phone).
  const DP = () => (globalThis.document?.querySelector?.('#screen')?.clientWidth || 276) / 320;
  function project(m, w, h, p) { return [(p.fx - m.cx) * 2 * w * m.z + w / 2, (p.fy - m.cy) * h * m.z + h * (m.ay ?? .5)]; }
  function draw(root, m, opts = {}) {
    const canvas = root.querySelector('.mp-canvas'); if (!canvas) return;
    const w = canvas.clientWidth, h = canvas.clientHeight, r = Math.min(2, window.devicePixelRatio || 1), d = DP();
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * r)) { canvas.width = Math.round(w * r); canvas.height = Math.round(h * r); }
    const key = `${w}x${h}:${m.mode}:${m.traffic}`;
    if (key !== sheetKey) { sheet = window.LiveWallpapers.mapSheet(w, h, m.mode, m.traffic); sheetKey = key; }
    const g = canvas.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0);
    g.fillStyle = m.mode === 'satellite' ? '#3d4a31' : '#e9e5dc'; g.fillRect(0, 0, w, h);
    const [x0, y0] = project(m, w, h, {fx: 0, fy: 0});
    g.drawImage(sheet, x0, y0, 2 * w * m.z, h * m.z);
    // The layers: transit lines with their stops, bike paths.
    const path = (pts, width, color, dash) => { g.setLineDash(dash || []); g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => { const [x, y] = project(m, w, h, {fx: p[0], fy: p[1]}); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.setLineDash([]); };
    if (m.bike) { for (const t of BIKE.trails) path(t, 3.4783 * d, '#1f6b2a'); for (const l of BIKE.lanes) path(l, 2.8986 * d, '#3e9b3a', [4.6377 * d, 3.4783 * d]); }
    if (m.transit) for (const l of TRANSIT) {
      path(l.stops, 3.4783 * d, l.color);
      for (const s of l.stops) { const [x, y] = project(m, w, h, {fx: s[0], fy: s[1]}); g.fillStyle = '#fff'; g.strokeStyle = l.color; g.lineWidth = 1.7391 * d; g.beginPath(); g.arc(x, y, 3.4783 * d, 0, Math.PI * 2); g.fill(); g.stroke(); }
    }
    // The route: the blue line along the streets from my location.
    if (m.route) {
      const pts = m.route.path.map(p => project(m, w, h, p));
      g.lineCap = 'round'; g.lineJoin = 'round';
      for (const [width, color] of [[8.1159 * d, '#1c3f9a99'], [5.2174 * d, '#4b7bf0d0']]) { g.strokeStyle = color; g.lineWidth = width; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
    }
    // My location: the blue dot with its accuracy circle.
    const [mx, my] = project(m, w, h, opts.me || ME);
    g.fillStyle = '#5b8de628'; g.strokeStyle = '#5b8de6aa'; g.lineWidth = 1; g.beginPath(); g.arc(mx, my, 20.0967 * d * m.z, 0, Math.PI * 2); g.fill(); g.stroke();
    // Navigation draws the car's chevron where my location is, flat on the tilted map.
    const chevron = opts.chevron && root.querySelector('.mp-chevron');
    if (chevron?.complete) { g.drawImage(chevron, mx - 25.5073 * d, my - 25.5073 * d, 51.0145 * d, 51.0145 * d); return; }
    const dot = root.querySelector('.mp-dotimg');
    if (dot?.complete) g.drawImage(dot, mx - 8 * d, my - 8 * d, 16 * d, 16 * d); else { g.fillStyle = '#2f80ed'; g.beginPath(); g.arc(mx, my, 6.9566 * d, 0, Math.PI * 2); g.fill(); }
    // Labs: Measure's points (the first blue, the others red) and the Scale Bar in the lower left.
    if (m.measure?.length) {
      const pts = m.measure.map(p => project(m, w, h, p));
      g.strokeStyle = '#1c3f9a'; g.lineWidth = 2.8986 * d; g.lineCap = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
      pts.forEach(([x, y], i) => { g.fillStyle = i ? '#e2231a' : '#1a4fd8'; g.strokeStyle = '#fff'; g.lineWidth = 1.1594 * d; g.beginPath(); g.arc(x, y, 5.2174 * d, 0, Math.PI * 2); g.fill(); g.stroke(); });
    }
    if (labs.scale) scaleBar(g, w, h, m, d);
    // Markers and the bubble are buttons over the canvas.
    root.querySelectorAll('[data-fx]').forEach(el => { const [x, y] = project(m, w, h, {fx: +el.dataset.fx, fy: +el.dataset.fy}); el.style.transform = `translate(${x}px, ${y}px)`; });
  }
  // Scale Bar (lab_scale): feet above the line, metres below, each with its tick, up to about 100 dp long.
  function scaleBar(g, w, h, m, d) {
    const pxKm = 2 * w * m.z / 4, most = 100 * d;
    const pick = (list, perKm) => list.filter(v => v / perKm * pxKm <= most).pop() || list[0];
    const metres = pick([10, 20, 50, 100, 200, 500, 1000, 2000, 5000], 1000), feet = pick([50, 100, 200, 500, 1000, 2000, 5280, 10560], 3280.84);
    const lm = metres / 1000 * pxKm, lf = feet / 3280.84 * pxKm, x = 6.9566 * d, y = h - 20.8696 * d, end = x + Math.max(lm, lf);
    const label = (text, ty) => { g.font = `${12 * d}px DroidSans, sans-serif`; g.textBaseline = 'alphabetic'; g.lineWidth = 2.8986 * d; g.strokeStyle = '#ffffffcc'; g.lineJoin = 'round'; g.strokeText(text, x + 2.3189 * d, ty); g.fillStyle = '#000'; g.fillText(text, x + 2.3189 * d, ty); };
    for (const [width, color] of [[3.4783 * d, '#ffffffcc'], [1.7391 * d, '#000']]) {
      g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'square'; g.beginPath();
      g.moveTo(x, y - 9.2754 * d); g.lineTo(x, y + 9.2754 * d); g.moveTo(x, y); g.lineTo(end, y);
      g.moveTo(x + lf, y); g.lineTo(x + lf, y - 9.2754 * d); g.moveTo(x + lm, y); g.lineTo(x + lm, y + 9.2754 * d); g.stroke();
    }
    label(feet >= 5280 ? `${feet / 5280} mi` : `${feet} ft`, y - 3.4783 * d);
    label(metres >= 1000 ? `${metres / 1000} km` : `${metres} m`, y + 12.7537 * d);
  }
  function markers(ctx, m) {
    const {lang} = ctx;
    const list = m.results.map((id, i) => { const p = poi(id) || m.custom; return p ? `<button class="mp-marker" data-fx="${p.fx}" data-fy="${p.fy}" data-action="mp-select" data-id="${e(p.id)}" aria-label="${e(p.name)}"><i style="background-position:calc(${-8 * (i % 10)} * var(--dp)) 0"></i></button>` : ''; }).join('');
    const friends = m.friends ? FRIENDS.map(f => `<button class="mp-friend" data-fx="${f.fx}" data-fy="${f.fy}" data-action="mp-friend" data-id="${f.id}" aria-label="${e(f.name)}"><img src="${A('avatar_unknown')}" alt=""></button>`).join('') : '';
    const sel = m.selected && (poi(m.selected) || (m.custom?.id === m.selected ? m.custom : null) || FRIENDS.find(f => f.id === m.selected));
    const wiki = m.wiki ? WIKI.map(p => `<button class="mp-wiki" data-fx="${p.fx}" data-fy="${p.fy}" data-action="mp-select" data-id="${p.id}" aria-label="${e(p.name)}">W</button>`).join('') : '';
    const article = !sel && m.selected && m.wiki ? WIKI.find(p => p.id === m.selected) : null;
    // Bubble Buttons (lab_bubble_buttons): the place's bubble calls it or navigates there in one tap.
    const place = sel && labs.bubble && poi(sel.id);
    if (article) return `<div class="mp-layer">${list}${friends}${wiki}<button class="mp-bubble" data-fx="${article.fx}" data-fy="${article.fy}" data-action="mp-wiki-open" data-id="${article.id}"><span><b>${e(article.name)}</b><small>${e(ctx.t('Wikipedia'))}</small></span><img src="${A('directions_arrow_gray')}" alt=""></button></div>`;
    if (place) return `<div class="mp-layer">${m.route ? `<span class="mp-dest" data-fx="${m.route.to.fx}" data-fy="${m.route.to.fy}"><img src="${A('places_icon')}" alt=""></span>` : ''}${list}${friends}${wiki}<div class="mp-bubble mp-bb" data-fx="${place.fx}" data-fy="${place.fy}">${place.phone ? `<button class="mp-bbbtn" data-action="mp-call" data-id="${e(place.id)}" aria-label="${e(ctx.t('Call'))}"><img src="${A('sym_action_call')}" alt=""></button><img class="mp-bbdiv" src="${A('bubble_divider')}" alt="">` : ''}<button class="mp-bbmain" data-action="mp-page" data-id="${e(place.id)}"><span><b>${e(place.name)}</b><small>${e(place.address)}</small></span></button><img class="mp-bbdiv" src="${A('bubble_divider')}" alt=""><button class="mp-bbbtn" data-action="mp-navigate" data-id="${e(place.id)}" aria-label="${e(T(ctx.lang, 'Navigation'))}"><img src="${A('btn_navigate')}" alt=""></button></div></div>`;
    const bubble = sel ? `<button class="mp-bubble" data-fx="${sel.fx}" data-fy="${sel.fy}" data-action="mp-page" data-id="${e(sel.id)}"><span><b>${e(sel.name)}</b><small>${e(sel.address || sel.place || '')}</small></span><img src="${A('directions_arrow_gray')}" alt=""></button>` : '';
    const dest = m.route ? `<span class="mp-dest" data-fx="${m.route.to.fx}" data-fy="${m.route.to.fy}"><img src="${A('places_icon')}" alt=""></span>` : '';
    return `<div class="mp-layer">${dest}${list}${friends}${wiki}${bubble}</div>`;
  }
  function header(ctx, m) {
    const {lang} = ctx, divider = '<i class="mp-hdiv"></i>';
    return `<div class="mp-header"><form class="mp-search" data-form="mp-search"><img src="${A('magnifying_glass_grey')}" alt=""><input name="q" value="${e(m.query)}" placeholder="${e(T(lang, 'Search Maps'))}" aria-label="${e(T(lang, 'Search Maps'))}" autocomplete="off"></form>${divider}<button class="mp-hbtn" data-action="mp-places" aria-label="${e(T(lang, 'Places'))}"><img src="${A('btn_show_places')}" alt=""></button>${divider}<button class="mp-hbtn" data-action="mp-layers" aria-label="${e(T(lang, 'Layers'))}"><img src="${A('btn_show_layers')}" alt=""></button>${divider}<button class="mp-hbtn" data-action="mp-myloc" aria-label="My Location"><img src="${A('btn_show_myl')}" alt=""></button></div>`;
  }
  function mapView(ctx) {
    const {ui, lang} = ctx, m = state(ui);
    if (m.page) return placePage(ctx, m);
    const ribbon = m.route ? `<div class="mp-ribbon"><img src="${A(m.route.mode === 'walk' ? 'mode_walking' : m.route.mode === 'bike' ? 'mode_biking' : m.route.mode === 'transit' ? 'mode_transit_icon' : 'mode_drive')}" alt=""><span><b>${e(m.route.to.name)}</b><small>${e(distance(lang, m.route.km))} – ${e(minutes(lang, m.route.min))}</small></span><button data-action="mp-navigate" data-id="${e(m.route.to.id)}" aria-label="${e(T(lang, 'Navigation'))}"><img src="${A('btn_navigate')}" alt=""></button></div>` : '';
    const directions = m.dirOpen ? directionsPanel(ctx, m) : '';
    return `<div class="app-view mp" data-no-translate>${header(ctx, m)}<div class="mp-map${m.zoomShown ? ' zoom' : ''}"><img class="mp-dotimg" src="${A('blue_location')}" alt="" hidden><canvas class="mp-canvas"></canvas>${markers(ctx, m)}${ribbon}${labs.measure ? `<button class="mp-measure${m.measuring ? ' on' : ''}" data-action="mp-measure" aria-label="${e(ctx.t('Measure'))}" aria-pressed="${!!m.measuring}"></button>${m.measure?.length > 1 ? `<span class="mp-measure-total">${e(distance(lang, measured(m)))}</span>` : ''}` : ''}<div class="mp-zoom"><button class="mp-zoomout" data-action="mp-zoom" data-id="-1" aria-label="-"${m.z <= .75 ? ' disabled' : ''}></button><button class="mp-zoomin" data-action="mp-zoom" data-id="1" aria-label="+"${m.z >= 4 ? ' disabled' : ''}></button></div></div>${directions}</div>`;
  }
  // directions_input_dialog.xml: from / to fields, the travel modes and Go.
  function directionsPanel(ctx, m) {
    const {lang} = ctx, mode = m.dirMode || 'drive';
    const modes = [['drive', 'driving'], ['transit', 'transit'], ['bike', 'bike'], ['walk', 'walk']].map(([id, img]) => `<button type="button" class="mp-mode${mode === id ? ' on' : ''}" data-action="mp-mode" data-id="${id}" style="--off:url('${A(`mode_${img}_off`)}');--on:url('${A(`mode_${img}_on`)}')" aria-pressed="${mode === id}" aria-label="${e(id)}"><img src="${A(id === 'drive' ? 'mode_drive' : id === 'transit' ? 'mode_transit_icon' : id === 'bike' ? 'mode_biking' : 'mode_walking')}" alt=""></button>`).join('');
    return `<form class="mp-dir" data-form="mp-dir"><input class="mp-dirfield" name="from" value="${e(ctx.t('My Location'))}" aria-label="From" autocomplete="off"><input class="mp-dirfield" name="to" value="${e(m.dirTo || '')}" placeholder="${e(T(lang, 'Destination'))}" aria-label="${e(T(lang, 'Destination'))}" autocomplete="off"><div class="mp-dirrow">${modes}<i></i><button type="submit" class="mp-go">${e(T(lang, 'Go'))}</button></div></form>`;
  }
  function placePage(ctx, m) {
    const {lang, ui} = ctx, p = poi(m.page) || (m.custom?.id === m.page ? m.custom : null);
    if (!p) { m.page = ''; return mapView(ctx); }
    const starred = (ctx.data.mapsStarred || []).includes(p.id), d = km(ME, p);
    const row = (action, icon, label, sub = '') => `<button class="mp-row" data-action="${action}" data-id="${e(p.id)}"><img src="${icon}" alt=""><span><b>${e(label)}</b>${sub ? `<small>${e(sub)}</small>` : ''}</span></button>`;
    return `<div class="app-view mp mp-page" data-no-translate>${header(ctx, m)}<div class="mp-scroll"><div class="mp-title"><b>${e(p.name)}</b><small>${e(p.address || '')}</small>${p.rating ? `<span class="mp-stars">${stars(p.rating)}</span>` : ''}<small>${e(distance(lang, d))}</small><button class="mp-star${starred ? ' on' : ''}" data-action="mp-star" data-id="${e(p.id)}" aria-label="★"></button></div>
      ${row('mp-show', A('ic_menu_see_map'), T(lang, 'Map'))}${row('mp-directions', A('ic_menu_directions'), ctx.t('Directions'))}${row('mp-navigate', A('btn_navigate'), T(lang, 'Navigation'))}${p.phone ? row('mp-call', 'assets/gb-ic_menu_call.png', ctx.t('Call'), p.phone) : ''}</div></div>`;
  }

  // ---------- Places ----------
  // A category's places by distance; a tile of one's own lists its search's results.
  const customCat = ctx => String(ctx.ui.mpCat).startsWith('custom:') ? (ctx.data.placesCustom || [])[Number(String(ctx.ui.mpCat).slice(7))] ?? null : null;
  function catList(ctx) { const q = customCat(ctx); return (q !== null ? search(q).map(poi) : POIS.filter(p => p.cat === ctx.ui.mpCat)).sort((a, b) => km(ME, a) - km(ME, b)); }
  function places(ctx) {
    const {ui, lang} = ctx, m = state(ui);
    if (m.page) return placePage(ctx, m);
    if (ui.mpCat) {
      const list = catList(ctx), custom = customCat(ctx);
      const label = CATS.find(c => c[0] === ui.mpCat)?.[1] || '';
      return `<div class="app-view mp mp-places" data-no-translate><div class="mp-header mp-ptitle"><span>${e(custom ?? (label === 'Restaurants' || label === 'Attractions' || label === 'Gas Stations' ? T(lang, label) : ctx.t(label)))}</span><i class="mp-hdiv"></i><button class="mp-hbtn" data-action="mp-show-cat" aria-label="${e(T(lang, 'Map'))}"><img src="${A('btn_show_map')}" alt=""></button></div><div class="mp-scroll">${list.map((p, i) => `<button class="mp-result" data-action="mp-page" data-id="${p.id}"><i class="mp-letter" style="background-position:calc(${-16 * i} * var(--dp)) calc(3.4783 * var(--dp))"></i><span><span class="mp-rtop"><b>${e(p.name)}</b><small>${e(distance(lang, km(ME, p)))}</small></span><small>${e(p.address)}</small><span class="mp-stars">${stars(p.rating)}</span></span></button>`).join('')}</div></div>`;
    }
    const tile = (id, label, img) => `<button class="mp-tile" data-action="mp-cat" data-id="${id}"><img src="${A(img)}" alt=""><span>${e(label)}</span></button>`;
    return `<div class="app-view mp mp-places" data-no-translate><div class="mp-header"><form class="mp-search" data-form="mp-psearch"><img src="${A('magnifying_glass_grey')}" alt=""><input name="q" placeholder="${e(T(lang, 'Search'))} ${e(T(lang, 'Places'))}" aria-label="${e(T(lang, 'Search'))}" autocomplete="off"></form></div><div class="mp-scroll mp-grid">${CATS.map(([id, label]) => tile(id, ['Restaurants', 'Attractions', 'Gas Stations'].includes(label) ? T(lang, label) : ctx.t(label), `icon_${id}`)).join('')}${(ctx.data.placesCustom || []).map((q, i) => tile(`custom:${i}`, q, 'icon_star')).join('')}${tile('add', ctx.t('Add'), 'icon_add')}</div></div>`;
  }

  // ---------- Latitude ----------
  function latitude(ctx) {
    const {lang, data} = ctx, checked = data.latitudeCheckin;
    const ago = n => n < 60 ? AndroidStrings.format(ctx.t('%d min ago'), n) : AndroidStrings.format(ctx.t('%d hours ago'), Math.round(n / 60));
    const item = (id, name, desc, time, me) => `<button class="mp-fitem" data-action="${me ? 'mp-me' : 'mp-friend'}" data-id="${id}"><img src="${A('avatar_unknown')}" alt=""><span><span class="mp-frow"><b>${e(name)}</b><small>${e(time)}</small></span><small>${e(desc)}</small></span></button>`;
    const btn = (action, img, label) => `<i class="mp-hdiv"></i><button class="mp-hbtn" data-action="${action}" aria-label="${e(label)}"><img src="${A(img)}" alt=""></button>`;
    return `<div class="app-view mp mp-lat" data-no-translate><div class="mp-header mp-ptitle"><span>${e(T(lang, 'Latitude'))}</span>${btn('mp-checkin', 'btn_latitude_checkin', ctx.t('Check in'))}${btn('mp-addfriend', 'btn_latitude_add_friends', ctx.t('Add friends'))}${btn('mp-refresh', 'btn_latitude_refresh_friends', ctx.t('Refresh'))}</div><div class="mp-scroll">${item('me', ctx.t('Me'), checked ? `${checked}` : 'Riverside Park', ctx.t('Now'), true)}${FRIENDS.map(f => item(f.id, f.name, `${f.place}`, ago(f.minutes))).join('')}</div></div>`;
  }

  // ---------- Navigation ----------
  function navigation(ctx) {
    const {ui, lang, data} = ctx, nav = ui.mpNav;
    if (nav) return navScreen(ctx, nav);
    const recent = (data.navRecent || []).map(poi).filter(Boolean);
    const row = (action, img, label, id = '') => `<button class="mp-pick" data-action="${action}"${id ? ` data-id="${id}"` : ''}><img src="${A(img)}" alt=""><span>${e(label)}</span></button>`;
    return `<div class="app-view mp mp-navpick" data-no-translate><div class="mp-dabar"><i></i><img class="mp-dasep" src="${A('da_vertical_separator_light')}" alt=""><button data-action="mp-route-options" aria-label="${e(T(lang, 'Route options'))}"><img src="${A(avoiding(data).length ? 'da_btn_route_options_on' : 'da_btn_route_options_off')}" alt=""></button><img class="mp-dasep" src="${A('da_vertical_separator_light')}" alt=""><button class="mp-dashow" data-action="mp-open-maps"><img src="${A('da_btn_show_map')}" alt=""><b>${e(T(lang, 'Map'))}</b></button></div><div class="mp-scroll">${row('mp-speak', 'da_picker_speak_destination', T(lang, 'Speak Destination'))}${row('mp-type', 'da_picker_type_destination', T(lang, 'Type Destination'))}${row('mp-contacts', 'da_picker_contacts', T(lang, 'Contacts'))}${row('mp-starred', 'da_picker_starred_items', T(lang, 'Starred Places'))}${recent.length ? `<div class="mp-sep">${e(T(lang, 'Recent Destinations'))}</div>${recent.map(p => `<button class="mp-pick" data-action="mp-navigate" data-id="${p.id}"><img src="${A('da_marker_destination')}" alt=""><span>${e(p.name)}<small>${e(p.address)}</small></span></button>`).join('')}` : ''}</div></div>`;
  }
  function steps(lang, to) {
    const a = STREETS[(to.name.length) % STREETS.length], b = to.address.replace(/^\d+\s/, '') || STREETS[1];
    return [
      {icon: 'da_depart', text: AndroidStrings.format(T(lang, 'Head %1$s on %2$s'), T(lang, to.fy < ME.fy ? 'north' : 'south'), a), road: a},
      {icon: to.fx > ME.fx ? 'da_turn_right' : 'da_turn_slight_right', text: AndroidStrings.format(T(lang, to.fx > ME.fx ? 'Turn right onto %1$s' : 'Turn left onto %1$s'), b), road: b},
      {icon: 'da_turn_straight', text: AndroidStrings.format(T(lang, 'Continue onto %1$s'), b), road: b},
      {icon: 'da_turn_arrive', text: T(lang, 'Your destination is on the right.'), road: to.name}
    ];
  }
  // Directions List (da_directions_list_item.xml): the 48 dip turn icon 12 dip in, the 18 dip step text.
  function navList(ctx, nav) {
    const {lang} = ctx, to = poi(nav.to) || nav.custom;
    return `<div class="app-view mp mp-navlist" data-no-translate><div class="mp-scroll">${steps(lang, to).map((st, i) => `<div class="mp-navstep${i === Math.min(nav.step, 3) ? ' now' : ''}"><img src="${A(st.icon)}" alt=""><span><b>${e(st.text)}</b></span></div>`).join('')}</div></div>`;
  }
  function navScreen(ctx, nav) {
    if (ctx.ui.mpNavList) return navList(ctx, nav);
    const {lang} = ctx, to = poi(nav.to) || nav.custom, list = steps(lang, to), step = list[Math.min(nav.step, list.length - 1)];
    const left = Math.max(0, nav.km * (1 - nav.progress)), done = nav.progress >= 1;
    return `<div class="app-view mp mp-nav" data-no-translate><div class="mp-step"><div class="mp-turn"><img src="${A(done ? 'da_turn_arrive' : step.icon)}" alt=""><b>${e(done ? '' : distance(lang, left / (list.length - nav.step || 1)))}</b></div><img class="mp-vsep" src="${A('da_vertical_separator')}" alt=""><div class="mp-road"><b>${e(done ? T(lang, 'You have arrived.') : step.text)}</b></div></div><div class="mp-navmap"><canvas class="mp-canvas"></canvas><img class="mp-dotimg" src="${A('blue_location')}" alt="" hidden><img class="mp-chevron" src="${A('dav_chevron')}" alt="" hidden></div><div class="mp-status"><img src="${A('da_traffic_dot_green')}" alt=""><b>${e(done ? '' : minutes(lang, Math.ceil(nav.min * (1 - nav.progress))))}</b><img class="mp-vsep" src="${A('da_vertical_separator')}" alt=""><span>${e(done ? to.name : step.road)}</span></div></div>`;
  }

  function render(ctx) {
    const view = ctx.view;
    labs = ctx.data.appPrefs?.['maps-labs'] || {};
    if (view === 'places') return places(ctx);
    if (view === 'latitude') return latitude(ctx);
    if (view === 'navigation') return navigation(ctx);
    return mapView(ctx);
  }
  // The navigation run: the route is driven in 40 s; the map follows the car under the tilted camera.
  let navTimer = 0;
  function mounted(ctx) {
    const {ui, root} = ctx, m = state(ui);
    currentUI = ui;
    if (ctx.view === 'navigation' && ui.mpNav) {
      const nav = ui.mpNav, route = nav.path;
      const tick = () => {
        if (!root.isConnected || ui.mpNav !== nav) return;
        // The run goes on behind the Directions List; only the map drawing waits for the map.
        const canvas = root.querySelector('.mp-navmap .mp-canvas'); if (!canvas && !ui.mpNavList) return;
        nav.progress = Math.min(1, (Date.now() - nav.started) / 40000);
        const at = along(route, nav.progress), nm = {cx: at.fx, cy: at.fy, z: 2.2, ay: .86, mode: m.mode === 'satellite' ? 'satellite' : 'normal', traffic: m.traffic, route: {path: route}};
        if (canvas) draw(root.querySelector('.mp-navmap'), nm, {chevron: true, me: at});
        const step = Math.min(3, Math.floor(nav.progress * 4));
        if (step !== nav.step || (nav.progress >= 1 && !nav.done)) { nav.step = step; nav.done = nav.progress >= 1; clearTimeout(navTimer); ctx.render(); return; }
        if (nav.progress < 1) navTimer = setTimeout(tick, 120);
      };
      clearTimeout(navTimer); requestAnimationFrame(tick);
      return;
    }
    currentLang = ctx.lang; labs = ctx.data.appPrefs?.['maps-labs'] || {};
    // The map's tiles are now in the cache (Cache settings' Clear cache has something to clear).
    if (root.querySelector('.mp-map') && !ctx.data.mapsCache) { ctx.data.mapsCache = true; ctx.save(); }
    if (root.querySelector('.mp-map')) requestAnimationFrame(() => draw(root, m));
  }
  function along(path, t) {
    const lens = path.slice(1).map((p, i) => Math.hypot(p.fx - path[i].fx, p.fy - path[i].fy)), total = lens.reduce((a, b) => a + b, 0) || 1;
    let left = t * total;
    for (let i = 0; i < lens.length; i++) { if (left <= lens[i]) { const f = lens[i] ? left / lens[i] : 0; return {fx: path[i].fx + (path[i + 1].fx - path[i].fx) * f, fy: path[i].fy + (path[i + 1].fy - path[i].fy) * f}; } left -= lens[i]; }
    return path[path.length - 1];
  }
  function route(to, mode = 'drive', avoid = {}) {
    const side = avoid.highways && mode === 'drive', path = side ? [ME, {fx: ME.fx, fy: to.fy}, to] : [ME, {fx: to.fx, fy: ME.fy}, to];
    const d = (Math.abs(to.fx - ME.fx) * 4 + Math.abs(to.fy - ME.fy) * 3) * (side ? 1.15 : 1), speed = {drive: side ? 22 : 30, transit: 20, bike: 15, walk: 5}[mode] || 30;
    return {to, path, mode, km: d, min: Math.max(1, Math.round(d / speed * 60) + (mode === 'drive' ? 2 + (avoid.tolls ? 2 : 0) : 0))};
  }
  // The saved route options and the summary lines they add (da_avoiding_highways / _tolls).
  const avoiding = data => ['highways', 'tolls'].filter(k => data.navAvoid?.[k]);
  function search(query) {
    const q = String(query || '').trim(); if (!q) return [];
    const cat = Object.keys(WORDS).find(c => WORDS[c].test(q));
    const hits = POIS.filter(p => (cat && p.cat === cat) || p.name.toLowerCase().includes(q.toLowerCase()) || p.address.toLowerCase().includes(q.toLowerCase()));
    return hits.sort((a, b) => km(ME, a) - km(ME, b)).slice(0, 10).map(p => p.id);
  }
  // A search that matches no place lands on an address-like spot of its own (the geocoder's single result).
  function geocode(q) { const h = [...q].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); return {id: 'q', name: q, address: q, fx: .32 + (h % 37) / 100, fy: .3 + (h % 41) / 100, rating: 0}; }

  function menu(ctx) {
    const {ui, lang, view} = ctx, m = state(ui), t = ctx.t;
    if (view === 'navigation' && ui.mpNav) return [{action: 'mp-route-info', title: T(lang, 'Route Info'), icon: 'mp-da_ic_menu_route_info.png'}, {action: 'mp-nav-list', title: T(lang, 'Directions List'), icon: 'mp-da_ic_menu_listview.png'}, {action: 'mp-layers', title: T(lang, 'Layers'), icon: 'mp-da_ic_menu_layers.png'}, {action: 'mp-mute', title: T(lang, ui.mpMuted ? 'Unmute' : 'Mute'), icon: 'mp-da_ic_menu_mute.png'}, {action: 'mp-nav-search', title: T(lang, 'Search'), icon: 'mp-da_ic_menu_search.png'}, {action: 'mp-exit-nav', title: T(lang, 'Exit Navigation'), icon: 'mp-da_ic_menu_close_clear_cancel.png'}];
    if (view === 'navigation') return [{action: 'gbpref-open', id: 'maps-navigation', title: T(lang, 'Settings'), icon: 'ic_menu_preferences'}, {action: 'mp-unsupported', title: T(lang, 'Help'), icon: 'ic_menu_help'}, {action: 'mp-unsupported', title: T(lang, 'Terms, Privacy & Notices'), icon: 'mp-ic_menu_terms.png'}];
    if (view === 'latitude') return [{action: 'mp-friends-map', title: T(lang, 'Map'), icon: 'mp-ic_menu_see_map.png'}, {action: 'mp-refresh', title: t('Refresh'), icon: 'mp-ic_menu_refresh.png'}, {action: 'mp-addfriend', title: t('Add friends'), icon: 'ic_menu_add'}, {action: 'mp-checkin', title: t('Check in'), icon: 'mp-ic_menu_latitude_checkin.png'}, {action: 'mp-unsupported', title: T(lang, 'Settings'), icon: 'ic_menu_preferences'}];
    if (view === 'places') return [{action: 'mp-open-maps', title: T(lang, 'Map'), icon: 'mp-ic_menu_see_map.png'}, {action: 'mp-unsupported', title: T(lang, 'Help'), icon: 'mp-ic_menu_help.png'}];
    return [{action: 'mp-focus-search', title: T(lang, 'Search'), icon: 'mp-ic_menu_search.png'}, {action: 'mp-directions', title: t('Directions'), icon: 'mp-ic_menu_directions.png'}, {action: 'mp-starred', title: T(lang, 'Starred Places'), icon: 'mp-ic_menu_star.png'}, {action: 'mp-clear', title: T(lang, 'Clear Map'), icon: 'mp-ic_menu_delete.png'}, {action: 'mp-open-latitude', title: T(lang, 'Latitude'), icon: 'mp-ic_menu_latitude.png'},
      {action: 'gbpref-open', id: 'maps-labs', title: t('Labs'), icon: 'mp-ic_menu_labs.png'}, {action: 'gbpref-open', id: 'maps-cache', title: t('Cache settings'), icon: 'mp-ic_menu_cache_settings.png'}, {action: 'mp-unsupported', title: T(lang, 'Help'), icon: 'mp-ic_menu_help.png'}, {action: 'mp-unsupported', title: T(lang, 'Terms, Privacy & Notices'), icon: 'mp-ic_menu_terms.png'}, {action: 'mp-about', title: t('About'), icon: 'mp-ic_menu_about.png'}];
  }
  function dialog(kind, ctx) {
    const {ui, lang, data} = ctx, m = state(ui), t = ctx.t;
    if (kind === 'layers') return {title: T(lang, 'Layers'), items: [
      {action: 'mp-layer', id: 'traffic', title: T(lang, 'Traffic'), checked: m.traffic}, {action: 'mp-layer', id: 'satellite', title: T(lang, 'Satellite'), checked: m.mode === 'satellite'},
      {action: 'mp-layer', id: 'terrain', title: T(lang, 'Terrain'), checked: m.mode === 'terrain'}, {action: 'mp-layer', id: 'latitude', title: T(lang, 'Latitude'), checked: !!m.friends},
      {action: 'mp-layer', id: 'transit', title: t('Transit Lines'), checked: !!m.transit}, {action: 'mp-layer', id: 'bike', title: t('Bicycling'), checked: !!m.bike}, {action: 'mp-layer', id: 'wiki', title: t('Wikipedia'), checked: !!m.wiki}, {action: 'mp-clear', title: T(lang, 'Clear Map')}], choice: 'multi'};
    if (kind === 'starred') { const list = (data.mapsStarred || []).map(poi).filter(Boolean); return {title: T(lang, 'Starred Places'), items: list.length ? list.map(p => ({action: ctx.view === 'navigation' ? 'mp-navigate' : 'mp-page', id: p.id, title: p.name, summary: p.address})) : [{action: 'close-overlay', title: t('No starred places')}]}; }
    if (kind === 'contacts') return {title: T(lang, 'Contacts'), items: (ctx.contacts || []).slice(0, 4).map((c, i) => ({action: 'mp-navigate', id: POIS[(i * 5 + 2) % POIS.length].id, title: c.name, summary: POIS[(i * 5 + 2) % POIS.length].address}))};
    if (kind === 'type') return {title: T(lang, 'Type Destination'), custom: `<form data-form="mp-type"><input class="gbdlg-input" name="q" placeholder="${e(T(lang, 'Destination'))}" aria-label="${e(T(lang, 'Destination'))}" autocomplete="off"></form>`, buttons: [{action: 'mp-type-go', title: T(lang, 'Go')}, {action: 'close-overlay', title: T(lang, 'Cancel')}]};
    if (kind === 'exit') return {title: T(lang, 'Exit navigation?'), icon: 'ic_dialog_alert', message: T(lang, 'This will end all route guidance.'), buttons: [{action: 'mp-exit-ok', title: T(lang, 'OK')}, {action: 'close-overlay', title: T(lang, 'Cancel')}]};
    if (kind === 'route-options') { const d = ui.mpAvoidDraft || {}; return {title: T(lang, 'Route options'), items: [['highways', 'Avoid highways'], ['tolls', 'Avoid tolls']].map(([id, key]) => ({action: 'mp-avoid', id, title: T(lang, key), checked: !!d[id]})), choice: 'multi', buttons: [{action: 'mp-avoid-ok', title: T(lang, 'OK')}, {action: 'close-overlay', title: T(lang, 'Cancel')}]}; }
    if (kind === 'route') { const nav = ui.mpNav, to = nav && (poi(nav.to) || nav.custom); return {title: T(lang, 'Route Info'), message: to ? `${to.name}\n${distance(lang, nav.km)} – ${minutes(lang, nav.min)}${avoiding(ctx.data).map(k => `\n${T(lang, k === 'highways' ? 'Avoiding highways' : 'Avoiding tolls')}`).join('')}` : '', buttons: [{action: 'close-overlay', title: T(lang, 'OK')}]}; }
    // Places' Add: a search of one's own as a new tile (data.placesCustom).
    if (kind === 'add') return {title: t('Add'), custom: `<form data-form="mp-add"><input class="gbdlg-input" name="q" placeholder="${e(T(lang, 'Search'))}" aria-label="${e(t('Add'))}" autocomplete="off"></form>`, buttons: [{action: 'mp-add-ok', title: T(lang, 'OK')}, {action: 'close-overlay', title: T(lang, 'Cancel')}]};
    if (kind === 'about') return {title: T(lang, 'Maps'), message: 'Google Maps 5.4.0', buttons: [{action: 'close-overlay', title: T(lang, 'OK')}]};
    return null;
  }
  function showZoom(ctx) { const m = state(ctx.ui); m.zoomShown = true; ctx.root.querySelector('.mp-map')?.classList.add('zoom'); clearTimeout(zoomTimer); zoomTimer = setTimeout(() => { m.zoomShown = false; document.querySelector('.mp-map')?.classList.remove('zoom'); }, 3500); }
  function startNav(ctx, to, custom) {
    const {ui, data} = ctx, r = route(to, 'drive', data.navAvoid || {});
    data.navRecent = [to.id, ...(data.navRecent || []).filter(x => x !== to.id)].filter(id => poi(id)).slice(0, 5);
    ui.mpNav = {to: to.id, custom, path: r.path, km: r.km, min: r.min, step: 0, progress: 0, started: Date.now()};
    ui.overlay = ''; ctx.save(); ctx.renderOverlay();
    if (ctx.view !== 'navigation') ctx.openApp('navigation'); else ctx.render();
  }
  function handle(action, id, ctx) {
    const {ui, data, lang} = ctx, m = state(ui);
    const close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'mp-zoom': m.z = Math.max(.75, Math.min(4, m.z * (+id > 0 ? 1.5 : 1 / 1.5))); showZoom(ctx); draw(ctx.root, m); ctx.root.querySelector('.mp-zoomout').disabled = m.z <= .75; ctx.root.querySelector('.mp-zoomin').disabled = m.z >= 4; break;
      case 'mp-myloc': Object.assign(m, {cx: ME.fx, cy: ME.fy}); draw(ctx.root, m); break;
      case 'mp-places': ctx.openApp('places'); break;
      case 'mp-layers': ctx.dialog('layers'); break;
      case 'mp-layer':
        if (id === 'traffic') m.traffic = !m.traffic;
        else if (id === 'latitude') m.friends = !m.friends;
        else if (['transit', 'bike', 'wiki'].includes(id)) m[id] = !m[id];
        else m.mode = m.mode === id ? 'normal' : id;
        close(); ctx.save(); ctx.render(); break;
      case 'mp-select': m.selected = m.selected === id ? '' : id; ctx.render(); break;
      case 'mp-friend': { const f = FRIENDS.find(x => x.id === id); if (!f) break; m.friends = true; m.selected = id; Object.assign(m, {cx: f.fx, cy: f.fy}); if (ctx.view !== 'maps') { ctx.openApp('maps'); } else ctx.render(); break; }
      case 'mp-me': Object.assign(m, {cx: ME.fx, cy: ME.fy, selected: ''}); ctx.openApp('maps'); break;
      case 'mp-friends-map': m.friends = true; ctx.openApp('maps'); break;
      case 'mp-page': { if (FRIENDS.some(f => f.id === id)) break; close(); m.page = id; ctx.render(); break; }
      case 'mp-show': { const p = poi(id) || m.custom; m.page = ''; if (p) { if (!m.results.includes(p.id) && poi(p.id)) m.results = [p.id]; Object.assign(m, {cx: p.fx, cy: p.fy, selected: p.id}); } if (ctx.view !== 'maps') ctx.openApp('maps'); else ctx.render(); break; }
      case 'mp-star': { const list = data.mapsStarred ||= []; const i = list.indexOf(id); if (i >= 0) list.splice(i, 1); else list.push(id); ctx.save(); ctx.render(); break; }
      case 'mp-call': { const p = poi(id); if (p?.phone) ctx.call?.(p.phone); break; }
      case 'mp-directions': { const p = poi(id) || (id === 'q' ? m.custom : null); close(); m.page = ''; m.dirOpen = true; m.dirTo = p ? p.name : ''; m.dirMode ||= 'drive'; if (ctx.view !== 'maps') ctx.openApp('maps'); else ctx.render(); break; }
      case 'mp-mode': m.dirMode = id; m.dirTo = ctx.root.querySelector('.mp-dir [name=to]')?.value ?? m.dirTo; ctx.render(); break;
      case 'mp-navigate': { const p = poi(id) || (id === 'q' ? m.custom : null); if (p) startNav(ctx, p, p.id === 'q' ? p : undefined); break; }
      case 'mp-clear': close(); Object.assign(m, {results: [], selected: '', route: null, query: '', custom: null, dirOpen: false, friends: false, transit: false, bike: false, wiki: false, measure: []}); ctx.render(); break;
      case 'mp-focus-search': close(); ctx.focus('.mp-search input'); break;
      case 'mp-starred': ctx.dialog('starred'); break;
      case 'mp-open-latitude': close(); ctx.openApp('latitude'); break;
      case 'mp-open-maps': close(); ctx.openApp('maps'); break;
      case 'mp-about': ctx.dialog('about'); break;
      case 'mp-cat': if (id === 'add') { ctx.dialog('add'); ctx.focus('.gbdlg [name=q]'); break; } ui.mpCat = id; ctx.render(); break;
      case 'mp-add-ok': document.querySelector('.gbdlg form[data-form="mp-add"]')?.requestSubmit(); break;
      case 'mp-wiki-open': { const p = WIKI.find(x => x.id === id); if (p) ctx.browse(`http://en.m.wikipedia.org/wiki/${p.article}`); break; }
      // Measure: the button starts measuring; while points are down it clears them and stops (btn_measure_up_clear).
      case 'mp-measure': m.measuring = !m.measuring; m.measure = []; ctx.render(); break;
      case 'mp-show-cat': { const list = catList(ctx); Object.assign(m, {results: list.map(p => p.id), selected: '', query: '', page: '', cx: ME.fx, cy: ME.fy}); ctx.openApp('maps'); break; }
      case 'mp-checkin': data.latitudeCheckin = 'Riverside Park'; ctx.save(); ctx.toast(`${ctx.t('Check in')}: Riverside Park`); ctx.render(); break;
      case 'mp-addfriend': ctx.toast('This feature is not part of the simulator.'); break;
      case 'mp-refresh': ctx.render(); break;
      case 'mp-speak': ctx.openApp('voice-search'); break;
      case 'mp-type': ctx.dialog('type'); ctx.focus('.gbdlg [name=q]'); break;
      case 'mp-type-go': document.querySelector('.gbdlg form[data-form="mp-type"]')?.requestSubmit(); break;
      case 'mp-contacts': ctx.dialog('contacts'); break;
      case 'mp-route-info': ctx.dialog('route'); break;
      case 'mp-nav-list': close(); ui.mpNavList = true; ctx.render(); break;
      case 'mp-route-options': ui.mpAvoidDraft = {...(data.navAvoid || {})}; ctx.dialog('route-options'); break;
      case 'mp-avoid': ui.mpAvoidDraft[id] = !ui.mpAvoidDraft[id]; ctx.renderOverlay(); break;
      case 'mp-avoid-ok': data.navAvoid = ui.mpAvoidDraft; ctx.save(); close(); ctx.render(); break;
      case 'mp-mute': ui.mpMuted = !ui.mpMuted; close(); break;
      case 'mp-nav-search': close(); ctx.dialog('type'); break;
      case 'mp-exit-nav': ctx.dialog('exit'); break;
      case 'mp-exit-ok': ui.mpNav = null; ui.mpNavList = false; clearTimeout(navTimer); close(); ctx.render(); break;
      case 'mp-unsupported': close(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  function submit(form, values, ctx) {
    const {ui} = ctx, m = state(ui);
    if (form === 'mp-search' || form === 'mp-psearch') {
      const q = String(values.get('q') || '').trim(); if (!q) return true;
      const ids = search(q);
      m.query = q; m.page = ''; m.route = null; m.dirOpen = false;
      if (ids.length) { m.results = ids; m.custom = null; const first = poi(ids[0]); Object.assign(m, {selected: ids[0], cx: first.fx, cy: first.fy}); }
      else { m.custom = geocode(q); m.results = []; Object.assign(m, {selected: 'q', cx: m.custom.fx, cy: m.custom.fy}); }
      if (ctx.view !== 'maps') ctx.openApp('maps'); else ctx.render();
      return true;
    }
    if (form === 'mp-dir') {
      const q = String(values.get('to') || '').trim(); if (!q) { ctx.toast(T(ctx.lang, 'Destination')); return true; }
      const ids = search(q), to = ids.length ? poi(ids[0]) : (m.custom?.name === q ? m.custom : geocode(q));
      if (to.id === 'q') m.custom = to;
      m.route = route(to, m.dirMode || 'drive'); m.dirOpen = false; m.selected = ''; m.results = ids.length ? [to.id] : []; Object.assign(m, {cx: (ME.fx + to.fx) / 2, cy: (ME.fy + to.fy) / 2});
      ctx.render(); return true;
    }
    if (form === 'mp-add') {
      const q = String(values.get('q') || '').trim(); ctx.ui.overlay = ''; ctx.renderOverlay(); if (!q) return true;
      const list = ctx.data.placesCustom ||= []; if (!list.includes(q)) list.push(q); ctx.save(); ctx.render(); return true;
    }
    if (form === 'mp-type') {
      const q = String(values.get('q') || '').trim(); if (!q) return true;
      const ids = search(q), to = ids.length ? poi(ids[0]) : geocode(q);
      startNav(ctx, to, to.id === 'q' ? to : undefined); return true;
    }
    return false;
  }
  function back(ctx) {
    const {ui, view} = ctx, m = state(ui);
    if (view === 'navigation' && ui.mpNavList) { ui.mpNavList = false; ctx.render(); return true; }
    if (view === 'navigation' && ui.mpNav) { ctx.dialog('exit'); return true; }
    if (m.page) { m.page = ''; ctx.render(); return true; }
    if (view === 'places' && ui.mpCat) { ui.mpCat = ''; ctx.render(); return true; }
    if (view === 'maps' && m.dirOpen) { m.dirOpen = false; ctx.render(); return true; }
    if (view === 'maps' && m.selected) { m.selected = ''; ctx.render(); return true; }
    return false;
  }
  function open(ctx, resume) { const {ui} = ctx; if (!resume) { if (ctx.view === 'places') ui.mpCat = ''; state(ui).page = ''; } }
  // Dragging the map pans it; a tap without movement shows the zoom buttons and closes the bubble.
  document.addEventListener('pointerdown', event => {
    const canvas = event.target.closest?.('.mp-map .mp-canvas'); if (!canvas) return;
    const ui = currentUI; if (!ui) return;
    const box = canvas.getBoundingClientRect();
    drag = {left: box.left, top: box.top, x: event.clientX, y: event.clientY, cx: ui.mp.cx, cy: ui.mp.cy, moved: false, canvas, scale: canvas.getBoundingClientRect().width / canvas.clientWidth || 1};
    canvas.setPointerCapture?.(event.pointerId);
  });
  document.addEventListener('pointermove', event => {
    if (!drag) return; const ui = currentUI; if (!ui) return;
    const dx = (event.clientX - drag.x) / drag.scale, dy = (event.clientY - drag.y) / drag.scale, w = drag.canvas.clientWidth, h = drag.canvas.clientHeight, m = ui.mp;
    if (Math.hypot(dx, dy) > 4.6377 * DP()) drag.moved = true;
    m.cx = Math.max(0, Math.min(1, drag.cx - dx / (2 * w * m.z))); m.cy = Math.max(0, Math.min(1, drag.cy - dy / (h * m.z)));
    draw(drag.canvas.closest('.mp-map'), m);
  });
  document.addEventListener('pointerup', () => {
    if (!drag) return; const d = drag; drag = null;
    if (!d.moved && currentUI?.mp?.measuring) { measureTap(d); return; }
    if (!d.moved) { const map = d.canvas.closest('.mp-map'); map?.classList.add('zoom'); clearTimeout(zoomTimer); zoomTimer = setTimeout(() => map?.classList.remove('zoom'), 3500); const ui = currentUI; if (ui?.mp?.selected) { ui.mp.selected = ''; map?.querySelector('.mp-bubble')?.remove(); } }
  });
  const module = {render, mounted, menu, dialog, handle, submit, back, open};
  for (const id of APPS) GBApps.register(id, module);
  // Measure: a tap puts a point where it lands (project() backwards); the total is shown over the map.
  const measured = m => (m.measure || []).slice(1).reduce((sum, p, i) => sum + km(m.measure[i], p), 0);
  function measureTap(d) {
    const m = currentUI.mp, c = d.canvas, w = c.clientWidth, h = c.clientHeight, x = (d.x - d.left) / d.scale, y = (d.y - d.top) / d.scale;
    (m.measure ||= []).push({fx: (x - w / 2) / (2 * w * m.z) + m.cx, fy: (y - h * .5) / (h * m.z) + m.cy});
    const map = c.closest('.mp-map'); draw(map, m);
    let total = map.querySelector('.mp-measure-total');
    if (m.measure.length > 1) { if (!total) { total = document.createElement('span'); total.className = 'mp-measure-total'; map.querySelector('.mp-measure')?.after(total); } total.textContent = distance(currentLang, measured(m)); }
  }
  // A geo: point from another app (Gallery's Show on map, Util.openMaps): the map centred on it with its marker.
  function showPoint(ui, p) {
    const m = state(ui);
    m.custom = {id: 'q', name: p.name, address: p.address, fx: p.fx, fy: p.fy, rating: 0};
    Object.assign(m, {results: [], selected: 'q', cx: p.fx, cy: p.fy, page: '', route: null, dirOpen: false});
  }
  window.GBMaps = {POIS, FRIENDS, ME, WIKI, search, route, km, distance, T, showPoint, place: (fx, fy) => [...POIS].sort((a, b) => km({fx, fy}, a) - km({fx, fy}, b))[0]};
})();
