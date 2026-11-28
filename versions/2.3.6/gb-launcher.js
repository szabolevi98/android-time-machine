/* Android 2.3.6 Launcher2 pieces: the button cluster (hotseat), the previous/next screen arrows, the QuickSearchBox
   search widget and the Protips "Home screen tips" widget. hdpi px x 0.575, 1 dp = 0.8625px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

  // Protips res/values*/arrays.xml: the first line is the bold header; "@drawable/x" puts that bitmap at the right.
  const TIPS = {
    en: [
      ['See all your apps.', 'Touch the Launcher icon.', 'all_apps'],
      ['Drag apps to your Home screen.', 'Touch & hold an app in the Launcher until it vibrates.'],
      ['Rearrange your Home screen.', 'Touch & hold an item and when it vibrates, drag it where you want.'],
      ['Remove items.', 'Touch & hold an item and when it vibrates, drag it to the Trash icon.', 'trash'],
      ['Multiple Home screens.', 'Swipe left or right to switch. Drag items to other screens.'],
      ['Done with this widget?', 'Touch & hold it and when it vibrates, drag it to the Trash icon.']
    ],
    hu: [
      ['Az összes alkalmazás megtekintése.', 'Érintse meg az Indító ikont.', 'all_apps'],
      ['Alkalmazások elhelyezése a főoldalon.', 'Tartsa az ujját az Indító egyik alkalmazásán, amíg az nem rezeg.'],
      ['A főoldal átrendezése.', 'Érintsen meg egy elemet és tartsa rajta az ujját, majd amikor rezeg, húzza a kívánt helyre.'],
      ['Elemek eltávolítása.', 'Érintsen meg egy elemet és tartsa rajta az ujját, majd amikor rezeg, húzza a Kuka ikonra.', 'trash'],
      ['Több főoldal.', 'Csúsztassa balra vagy jobbra a váltáshoz. Húzzon át elemeket egy másik képernyőkre.'],
      ['Nem használ már egy modult?', 'Érintse meg és tartsa rajta az ujját, majd amikor rezeg, húzza a Kuka ikonra.']
    ],
    de: [
      ['Alle Apps auf einen Blick:', 'Berühren Sie das Übersichtssymbol.', 'all_apps'],
      ['Apps auf den Startbildschirm ziehen:', 'Berühren & halten Sie ein App in der Übersicht, bis es vibriert.'],
      ['Startbildschirm neu anordnen:', 'Berühren & halten Sie ein Element. Sobald es vibriert, ziehen Sie es in Position.'],
      ['Elemente entfernen:', 'Berühren & halten Sie ein Element und ziehen Sie es in den Papierkorb.', 'trash'],
      ['Mehrere Startbildschirme:', 'Ziehen Sie zum Wechseln nach links oder rechts. Ziehen Sie Elemente auf andere Bildschirme.'],
      ['Dieses Widget entfernen?', 'Berühren & halten Sie es. Sobald es vibriert, ziehen Sie es in den Papierkorb.']
    ],
    fr: [
      ['Accéder aux applications', 'Appuyez sur le lanceur d\'applications.', 'all_apps'],
      ['Ajouter des applications à l\'écran d\'accueil', 'Appuyez sur une application du lanceur jusqu\'à ce qu\'elle vibre, puis faites-la glisser.'],
      ['Organiser l\'écran d\'accueil', 'Appuyez sur un élément et maintenez. Lorsqu\'il vibre, placez-le à l\'endroit souhaité.'],
      ['Supprimer un élément', 'Appuyez sur l\'élément et maintenez. Lorsqu\'il vibre, déplacez-le vers la corbeille.', 'trash'],
      ['Écrans d\'accueil multiples', 'Faites glisser l\'écran vers la droite/gauche. Déplacez les icônes d\'un écran à l\'autre.'],
      ['Supprimer un widget', 'Appuyez dessus et maintenez. Quand il vibre, déplacez-le vers la corbeille.']
    ],
    es: [
      ['Accede a tus aplicaciones', 'Toca en el icono cuadrado.', 'all_apps'],
      ['Añade aplicaciones al escritorio', 'Mantén pulsada una aplicación hasta que vibre.'],
      ['Organiza el escritorio', 'Mantén pulsado un icono. Cuando la pantalla vibre, arrástralo a donde quieras.'],
      ['Elimina iconos', 'Mantén pulsado un icono. Cuando la pantalla vibre, arrástralo hasta la papelera.', 'trash'],
      ['Crea varias pantallas', 'Desliza el dedo hacia la izquierda o derecha y arrastra iconos a otras pantallas.'],
      ['¿Quieres cerrar este widget?', 'Manténlo pulsado. Cuando la pantalla vibre, arrástralo a la papelera.']
    ]
  };
  // tips2 ("dial *#*#TIPS#*#*", not translated): haiku, one line per row.
  const HAIKU = [
    ['Home is a garden', 'Touch & hold an empty spot\nTo grow new icons'],
    ['Phone isn’t waterproof', 'Do not immerse in water\nor other fluids'],
    ['Want some more home screens?', 'Swipe left and right to find them\n(No theft required)'],
    ['Little Home screen dots', 'What could they possibly do?\nTouch & hold to learn.'],
    ['Status bar icons', 'To discover their secrets\nPull the windowshade'],
    ['There is a trick to', 'Dragging items twixt Home screens\nPause at the edges'],
    ['Touch Market for apps', 'Like a box of chocolates\nEach one a surprise'],
    ['Oh, and by the way:', 'Ceci n’est pas une trombone\nI am an Android']
  ];
  const tips = (lang, set) => set === 1 ? HAIKU : TIPS[lang] || TIPS.en;
  // R.string.pager_footer "%1$d of %2$d" (10 sp bold #AAAAAA). The 2.3.6 Hungarian string swaps the numbers ("6/1").
  const FOOTER = {res: 'Protips:pager_footer', en: '%1$d of %2$d', hu: '%2$d/%1$d', de: '%1$d von %2$d', fr: '%1$d sur %2$d', es: '%1$d de %2$d'};
  function protips(state, lang) {
    const list = tips(lang, state.set), index = state.index < 0 ? -1 : state.index % list.length, tip = list[index];
    const bubble = tip ? `<button class="gbtips-bubble" data-action="gb-tip-next" aria-label="${e(tip[0])}"><span class="gbtips-text"><strong>${e(tip[0])}</strong><span>${e(tip[1]).replace(/\n/g, '<br>')}</span></span>${tip[2] ? `<img class="gbtips-callout" src="assets/gb-tips-${tip[2]}.png" alt="">` : ''}<span class="gbtips-footer">${e(AndroidStrings.format(AndroidStrings.pick(FOOTER, lang, ''), index + 1, list.length))}</span></button>` : '';
    return `<div class="gbtips">${bubble}<button class="gbtips-droid" data-action="gb-tip-poke" aria-label="Android"><img src="assets/gb-tips-${state.icon || 'droidman_open'}.png" alt=""></button></div>`;
  }
  // ProtipWidget.blink: closed 100 ms, then (open 200 ms, closed 100 ms) per extra blink, then open.
  function blinkFrames(times) {
    const frames = [['droidman_closed', 100]];
    for (let i = 1; i < times; i++) frames.push(['droidman_open', 200], ['droidman_closed', 100]);
    frames.push(['droidman_open', 0]);
    return frames;
  }

  // QuickSearchBox search_widget.xml: corpus indicator, the "Google" hint field and the voice button on search_floater.
  const search = t => `<div class="gbqsb"><button class="gbqsb-corpus" data-action="browser-search" aria-label="${e(t('Search'))}"><img src="assets/gb-qsb-search_app_icon.png?v=2" alt=""></button><button class="gbqsb-field" data-action="browser-search" aria-label="Google"><img src="assets/gb-qsb-hint_google.png" alt=""></button><button class="gbqsb-voice" data-action="voice-search" aria-label="${e(t('Voice search'))}"><img src="assets/gb-qsb-ic_btn_speak_now.png" alt=""></button></div>`;

  // launcher.xml (port): all_apps_button_cluster (phone, all apps, browser) and the 93 dp previous/next screen buttons
  // whose home_arrows level-list shows one dot per screen on that side (up to four).
  const dock = t => `<div class="gbl-cluster"><button class="gbl-hotseat gbl-hotseat-left" data-action="open-app" data-app="phone" aria-label="${e(t('Phone'))}"><span class="gbl-hotseat-phone"></span></button><button class="gbl-allapps" data-action="drawer" aria-label="${e(t('Apps'))}"><span></span></button><button class="gbl-hotseat gbl-hotseat-right" data-action="open-app" data-app="browser" aria-label="${e(t('Browser'))}"><span class="gbl-hotseat-browser"></span></button></div>`;
  function arrows(page, count, t) {
    const left = Math.min(4, page), right = Math.min(4, count - 1 - page);
    return `<button class="gbl-arrow gbl-arrow-left" data-action="page" data-id="${page - 1}" ${left ? '' : 'hidden'} aria-label="${e(t('Previous screen'))}" style="--dots:url('assets/gb-l2-ic_home_arrows_${left || 1}_normal.png');--dots-press:url('assets/gb-l2-ic_home_arrows_${left || 1}_press.png')"></button><button class="gbl-arrow gbl-arrow-right" data-action="page" data-id="${page + 1}" ${right ? '' : 'hidden'} aria-label="${e(t('Next screen'))}" style="--dots:url('assets/gb-l2-ic_home_arrows_${right || 1}_normal_right.png');--dots-press:url('assets/gb-l2-ic_home_arrows_${right || 1}_press_right.png')"></button>`;
  }

  // Music album_appwidget.xml (layout-finger): appwidget_bg with a 3:1:1 split - title (18 sp bold) and artist
  // (14 sp) or "Touch to select music.", then play/pause and next, separated by 1 dp dividers.
  function music(music, track, active, t) {
    const text = active ? `<strong>${e(track.title)}</strong><span>${e(track.artist)}</span>` : `<span>${e(t('Touch to select music.'))}</span>`;
    return `<div class="gbmusic"><button class="gbmusic-info" data-action="widget-music-open">${text}</button><i></i><button class="gbmusic-play" data-action="widget-music-play" aria-label="${e(t(music.playing ? 'Pause' : 'Play'))}"><img src="assets/gb-music-ic_appwidget_music_${music.playing ? 'pause' : 'play'}.png" alt=""></button><i></i><button class="gbmusic-next" data-action="widget-music-next" aria-label="${e(t('Next'))}"><img src="assets/gb-music-ic_appwidget_music_next.png" alt=""></button></div>`;
  }

  window.GBLauncher = {TIPS, HAIKU, tips, protips, blinkFrames, search, dock, arrows, music};
})();

/* The launcher of Android 2.3.6 (Launcher2 of GRK39F) as modules (docs/plans/engine-migration.md): the home screen
   ('home': the five workspaces with their shortcuts, folders and widgets, the dock, the arrows and their previews, the
   Menu key's options, Add to Home screen and its pickers, the wallpaper choosers, the widgets' buttons, drag and drop
   with the delete zone, page swipes and the wheel, the photo stack and the widgets' minute refresh) and the app drawer
   ('drawer': AllApps2D with its swipe). Their gestures (a press may start on home and end on the drawer, or the other
   way) listen on the page once (init); the shade's pull, the cards' swipes and app lists' mouse scrolling are the
   shell's. */
(() => {
  'use strict';
  const i18n = window.AndroidI18n;
  let widgetTypeList = null, press = null, dragTimer = null, dragState = null, homeLongPressTimer = null, openFolderId = '', lastWidgetMinute = '';
  // The shell's bindings the launcher's code uses, and its helpers on them.
  function shell(c) {
    const {data, ui, save, render, renderOverlay, toast, openApp, screen, viewport, overlayRoot, dp, safe, apps, appIcon, launcherIcon, folderName, snapResting, reducedMotion, tweenWallpaperOffset, saveMusic} = c, tracks = ICSMusic.tracks, gappContext = c.gapp, gbBrowserTitle = c.browserTitle, renderWebsite = c.renderWebsite, clock = c.clock, fullDate = c.fullDate, deviceDate = c.deviceDate;
    // The 2.3.6 widget providers (AppWidgetPickActivity, sorted by label): the AOSP and Market ones, then the Google apps'
    // (Calendar's comes from CalendarProvider, Latitude and Traffic from Maps, the two Voice ones from Google Voice).
    const widgetTypes = widgetTypeList ||= [...GBWidgets.PROVIDERS, ...GBGoogleWidgets.PROVIDERS].sort((a, b) => a.label.localeCompare(b.label, 'en')).map(p => ({type: p.type, name: p.label, app: p.app, width: p.width, height: p.height}));
    const widgetSize = value => {
      const widget = typeof value === 'string' ? {type: value} : value;
      return {...(widgetTypes.find(item => item.type === widget.type) || {width: 2, height: 2}), ...widget};
    };
    // Launcher.onCreateOptionsMenu: Add, Manage apps, Wallpaper / Search, Notifications, Settings.
    const launcherMenu = () => [
      {action: 'gb-add', title: i18n.t('Add'), icon: 'ic_menu_add'},
      {action: 'settings-open', id: 'apps', title: i18n.t('Manage apps'), icon: 'ic_menu_manage'},
      {action: 'gb-wallpaper', title: i18n.t('Wallpaper'), icon: 'ic_menu_gallery'},
      {action: 'browser-search', title: i18n.t('Search'), icon: 'ic_search_category_default'},
      {action: 'gb-notifications', title: i18n.t('Notifications'), icon: 'ic_menu_notifications'},
      {action: 'open-app', app: 'settings', title: i18n.t('Settings'), icon: 'ic_menu_preferences'}
    ];
    function analogClock() {
      const now = deviceDate();
      return `<div class="analog-clock" aria-label="${clock()}"><img class="clock-dial" src="assets/appwidget_clock_dial.png" alt=""><img class="clock-hour" src="assets/appwidget_clock_hour.png" alt="" style="transform:rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)"><img class="clock-minute" src="assets/appwidget_clock_minute.png" alt="" style="transform:rotate(${now.getMinutes() * 6}deg)"></div>`;
    }
    // Drawer and drag previews use the providers' original previewImage artwork where AOSP has one.
    // Calendar, Latitude, Traffic and the Google Voice widgets render the same live content in the picker and on the home screen.
    function googleWidget(type) {
      const ctx = {...gappContext(), events: data.calendarState ? [] : data.events};
      return {calendar: GBGoogleWidgets.calendar, latitude: GBGoogleWidgets.latitude, traffic: GBGoogleWidgets.traffic, 'gvoice-inbox': GBGoogleWidgets.voiceInbox, 'gvoice-settings': GBGoogleWidgets.voiceSettings, 'rate-places': GBGoogleWidgets.ratePlaces}[type]?.(ctx) ?? null;
    }
    function widgetArt(type) {
      const google = googleWidget(type);
      if (google) return google;
      if (type === 'analog') return GBWidgets.analog(deviceDate());
      if (type === 'photo') return GBWidgets.pictureFrame(data.photos[0], ICSMedia.image);
      if (type === 'bookmarks') return GBWidgets.bookmarks(data.bookmarks || [], 0, gbBrowserTitle, renderWebsite);
      if (type === 'digital') return `<strong class="widget-time">${clock()}</strong><span>${fullDate()}</span>`;
      if (type === 'weather') return '<strong class="widget-weather">☀ 22°</strong><span>Sunny · San Francisco</span>';
      if (type === 'music') return GBLauncher.music(ui.music, tracks[ui.music.track], false, key => i18n.t(key));
      if (type === 'power') return GBWidgets.power({...GBSettings.DEFAULTS, ...data.settings});
      if (type === 'news-weather') return GBWidgets.newsWeather(i18n.language);
      if (type === 'youtube') return GBWidgets.youtube(i18n.language);
      if (type === 'market') return GBWidgets.market(GBMarket.all().filter(item => !item.app).slice(0, 4));
      if (type === 'power-ics') return `<div class="power-widget">${[['wifi','wifi'],['bluetooth','bluetooth'],['gps','gps'],['autoSync','sync'],['brightness','brightness']].map(([key,asset]) => `<span class="power-cell ${data.settings[key] ? 'enabled' : ''}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></span>`).join('')}</div>`;
      return '<img class="widget-preview-image" src="assets/gallery-widget_preview.png" alt="">';
    }
    const musicActive = () => ui.music.playing || ui.music.position > 0 || !!ui.musicActive;
    function widgetBody(widget) {
      const t = key => i18n.t(key);
      if (widget.type === 'search') return GBLauncher.search(t);
      if (widget.type === 'protips') return GBLauncher.protips({...(data.protips || {index: 0, set: 0}), icon: ui.tipsIcon}, i18n.language);
      if (widget.type === 'analog') return GBWidgets.analog(deviceDate());
      if (widget.type === 'power') return GBWidgets.power({...GBSettings.DEFAULTS, ...data.settings}, t);
      if (widget.type === 'bookmarks') return GBWidgets.bookmarks(data.bookmarks || [], ui.bookmarkWidget?.[widget.id] || 0, gbBrowserTitle, renderWebsite);
      if (widget.type === 'music') return GBLauncher.music(ui.music, tracks[ui.music.track], musicActive(), t);
      if (widget.type === 'news-weather') return GBWidgets.newsWeather(i18n.language);
      if (widget.type === 'youtube') return GBWidgets.youtube(i18n.language);
      const google = googleWidget(widget.type);
      if (google) return google;
      if (widget.type === 'market') return GBWidgets.market(GBMarket.all().filter(item => !item.app && ['apps', 'games'].includes(item.kind || 'apps')).slice(0, 4));
      if (widget.type === 'photo') { const photo = data.photos.find(p => p.id === widget.photo) || (widget.source === 'album' ? ICSMedia.photos(data, widget.album)[0] : widget.source === 'shuffle' ? data.photos[0] : null); return GBWidgets.pictureFrame(photo, ICSMedia.image); }
      return null;
    }
    const homeWidget = widget => {
      const spec = widgetSize(widget);
      const body = widgetBody(widget) ?? (widget.type === 'power' ? `<div class="power-widget">${[['wifi','Wi-Fi','wifi'],['bluetooth','Bluetooth','bluetooth'],['gps','GPS satellites','gps'],['autoSync','Auto-sync','sync'],['brightness','Brightness','brightness']].map(([key,title,asset]) => `<button class="power-cell ${data.settings[key] ? 'enabled' : ''}" data-action="power-toggle" data-id="${key}" aria-label="${title}" aria-pressed="${!!data.settings[key]}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></button>`).join('')}</div>` : `<button data-action="open-app" data-app="${spec.app || 'gallery'}" aria-label="${safe(spec.name || 'Widget')}">${widgetArt(widget.type)}</button>`);
      return `<div class="home-widget widget-${widget.type}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span ${spec.width};grid-row:${widget.y + 1}/span ${spec.height}">${body}</div>`;
    };
    function renderHome() {
      const t = key => i18n.t(key);
      return `<div class="home-view gbl"><div class="home-content"><div class="home-pages" style="transform:translateX(${-ui.page * 100}%)">${data.homePages.map((page, index) => `<div class="home-grid" data-home-page="${index}" ${index !== ui.page ? 'inert' : ''}>${page.map((id, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % 4 + 1};grid-row:${Math.floor(slot / 4) + 1}">${id ? launcherIcon(id) : ''}</div>`).join('')}${data.homeWidgets[index].map(homeWidget).join('')}</div>`).join('')}</div></div>${GBLauncher.arrows(ui.page, 5, t)}${GBLauncher.dock(t)}<div class="drop-target-bar gbl-delete"><div class="drop-target" data-drop-remove="true" aria-label="${safe(t('Remove'))}"><img src="assets/gb-l2-trashcan.png" alt=""><img class="drop-target-active" src="assets/gb-l2-trashcan_hover.png" alt=""></div></div></div>`;
    }
    // AllApps2D: a black 4-column GridView of application_boxed items (alphabetical) above the home button.
    function renderDrawer() {
      const sortedApps = [...apps].sort((a, b) => i18n.t(a[1]).localeCompare(i18n.t(b[1]), i18n.locale()));
      return `<div class="drawer-view gbl-allapps-view"><div class="drawer-page drawer-apps gbl-allapps-grid">${sortedApps.map(app => launcherIcon(app[0])).join('')}</div><button class="gbl-allapps-home" data-action="home" aria-label="${safe(i18n.t('Home'))}"></button></div>`;
    }
    function widgetFits(page, x, y, type, ignoredId = '') {
      const {width, height} = widgetSize(type);
      if (x < 0 || y < 0 || x + width > 4 || y + height > 4) return false;
      for (let row = y; row < y + height; row++) for (let column = x; column < x + width; column++) {
        if (data.homePages[page][row * 4 + column]) return false;
      }
      return !data.homeWidgets[page].some(widget => widget.id !== ignoredId && x < widget.x + widgetSize(widget).width && x + width > widget.x && y < widget.y + widgetSize(widget).height && y + height > widget.y);
    }
    function addWidget(type, x = null, y = null) {
      const spots = x === null ? Array.from({length:16}, (_, i) => [i % 4, Math.floor(i / 4)]) : [[x,y]];
      const spot = spots.find(([column,row]) => widgetFits(ui.page, column, row, type));
      if (!spot) return false;
      const widget = {id:`widget-${Date.now()}`,type,x:spot[0],y:spot[1]};
      // Gallery2 declares a configure activity; the widget stays empty until it finishes.
      if (type === 'photo') { widget.source = null; ui.photoWidgetSetup = {page: ui.page, id: widget.id}; ui.gbgPickPending = true; }
      data.homeWidgets[ui.page].push(widget);
      save(); return widget;
    }
    function stepPhotoStack(id, direction) {
      const widget = data.homeWidgets.flat().find(item => item.id === id);
      if (!widget) return;
      const count = ICSWidgets.photoItems(data, widget).length;
      if (count < 2) { render(); return; }
      ui.photoStacks = ui.photoStacks || {};
      ui.photoStacks[id] = ICSWidgets.wrap((ui.photoStacks[id] || 0) + direction, count);
      render();
      const stack = viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"]`);
      if (stack) stack.classList.add(direction > 0 ? 'stack-next' : 'stack-previous');
    }
    const pendingPhotoWidget = () => ui.photoWidgetSetup && data.homeWidgets[ui.photoWidgetSetup.page]?.find(widget => widget.id === ui.photoWidgetSetup.id);
    // Leaving WidgetConfigure without a choice removes the pending widget, as on Android.
    function cancelPhotoWidget() {
      const setup = ui.photoWidgetSetup;
      if (setup) data.homeWidgets[setup.page] = data.homeWidgets[setup.page].filter(widget => widget.id !== setup.id);
      ui.photoWidgetSetup = null; ui.overlay = ''; save(); render();
    }
    /* Launcher.showPreviews: each CellLayout is drawn at the scale that fits all five screens across the CellLayout width
       (minus the preview_background padding), without the wallpaper, in a PopupWindow next to the anchor. */
    function fillPreviews() {
      const popup = overlayRoot.querySelector('.gbprev'); if (!popup) return;
      const grids = [...viewport.querySelectorAll('.home-grid')];
      const width = screen.clientWidth, cellsHeight = viewport.clientHeight - dp(8) - dp(78.0058), thumbWidth = (width - 5 * dp(6.6667)) / 5, scale = thumbWidth / width;
      popup.querySelectorAll('.gbprev-thumb').forEach((thumb, index) => {
        thumb.style.width = `${thumbWidth}px`; thumb.style.height = `${cellsHeight * scale}px`;
        const clone = grids[index]?.cloneNode(true); if (!clone) return;
        clone.removeAttribute('inert'); clone.inert = true; clone.classList.add('gbprev-grid');
        Object.assign(clone.style, {width: `${width}px`, height: `${viewport.clientHeight}px`, transform: `scale(${scale}) translateY(-${dp(8)}px)`});
        thumb.append(clone);
      });
      const anchor = viewport.querySelector(ui.gbPreviewAnchor === 'next' ? '.gbl-arrow-right' : ui.gbPreviewAnchor === 'apps' ? '.gbl-allapps' : '.gbl-arrow-left');
      const screenRect = screen.getBoundingClientRect(), ratio = screen.clientWidth / screenRect.width, rect = anchor?.getBoundingClientRect();
      const left = rect ? Math.max(0, Math.min(width - popup.offsetWidth, (rect.left - screenRect.left) * ratio)) : 0;
      popup.style.left = `${left}px`;
    }
    /* UserFolder (user_folder.xml): Launcher.openFolder adds it over the whole CellLayout - a box_launcher_top title button
       (14 sp bold #404040; touch closes, touch & hold renames) above box_launcher_bottom with a 4-column grid of
       application_boxed items. Live folders list their contacts (live_folder_list). */
    function syncFolderIcons() {
      viewport.querySelectorAll('[data-folder-id]').forEach(button => { const icon = button.querySelector('.app-icon'); if (icon) icon.outerHTML = appIcon(button.dataset.folderId); });
    }
    function renderFolder() {
      const folder=ICSLauncherFolders.folder(data,ui.folderId);if(!folder){ui.overlay='';return '';}
      const people=folder.live?data.contacts.filter(person=>folder.live==='all'||folder.live==='phone'&&person.phone||folder.live==='starred'&&person.favorite).sort((a,b)=>a.name.localeCompare(b.name,i18n.locale())):null;
      const grid=people?`<div class="gbfolder-live">${people.map(person=>`<button class="gbfolder-person" data-action="gb-live-contact" data-id="${person.id}"><span class="avatar">${safe(person.name[0])}</span><span>${safe(person.name)}</span></button>`).join('')||`<p class="gbfolder-empty">${safe(i18n.t('No contacts.'))}</p>`}</div>`
        :`<div class="launcher-folder-grid gbfolder-grid">${Array.from({length:folder.items.length+1},(_,slot)=>`<div class="launcher-folder-cell" data-folder-slot="${slot}">${folder.items[slot]?launcherIcon(folder.items[slot]):''}</div>`).join('')}</div>`;
      return `<div class="launcher-folder gbfolder${folder.live?' gbfolder-livebox':''}" role="dialog" aria-label="${safe(i18n.t('Folder'))}: ${safe(folderName(ui.folderId))}"><button class="gbfolder-title" data-action="close-overlay" data-gb-folder-title>${safe(folderName(ui.folderId))}</button><div class="gbfolder-body">${grid}</div></div>`;
    }
    function positionFolder() {
      const panel=overlayRoot.querySelector('.launcher-folder');if(!panel||panel.classList.contains('gbfolder'))return;
      const icon=[...viewport.querySelectorAll('[data-folder-id]')].find(button=>button.dataset.folderId===ui.folderId&&!button.closest('[inert]'));
      const screenRect=screen.getBoundingClientRect(),rect=icon?.getBoundingClientRect();
      const scale=screenRect.width/screen.clientWidth;
      const x=rect?(rect.left+rect.width/2-screenRect.left)/scale:screen.clientWidth/2;
      const y=rect?(rect.top+rect.height/2-screenRect.top)/scale:screen.clientHeight/2;
      const left=Math.max(8,Math.min(screen.clientWidth-panel.offsetWidth-8,x-panel.offsetWidth/2));
      const top=Math.max(30,Math.min(screen.clientHeight-55-panel.offsetHeight,y-panel.offsetHeight/2));
      panel.style.left=left+'px';panel.style.top=top+'px';panel.style.setProperty('--folder-origin',`${x-left}px ${y-top}px`);
    }
    window.addEventListener('resize',()=>{if(ui.overlay==='folder')positionFolder();});
    function restoreWidgetScroll() {
      ui.widgetScroll = ui.widgetScroll || {};
      viewport.querySelectorAll('.home-widget .calw-list').forEach(list => {
        const id = list.closest('.home-widget').dataset.widgetId;
        list.scrollTop = ui.widgetScroll[id] || 0;
      });
    }
    function dragSource(target) {
      const homeWidget = target.closest('.home-widget[data-widget-id]');
      if (homeWidget) {
        const widget = data.homeWidgets[ui.page].find(item => item.id === homeWidget.dataset.widgetId);
        return widget ? { type: 'widget', id: widget.id, widgetType: widget.type, page: ui.page } : null;
      }
      const drawerWidget = target.closest('.drawer-widget[data-widget-type]');
      if (drawerWidget) return { type: 'drawer-widget', widgetType: drawerWidget.dataset.widgetType };
      const icon = target.closest('.launcher-icon');
      if (!icon) return null;
      const folderSlot=icon.closest('[data-folder-slot]');
      if(folderSlot&&ui.overlay==='folder')return {type:'folder',folderId:ui.folderId,slot:Number(folderSlot.dataset.folderSlot),id:icon.dataset.app};
      const homeSlot = icon.closest('[data-home-slot]');
      if (homeSlot) return { type: 'home', slot: Number(homeSlot.dataset.homeSlot), page: ui.page, id: data.homePages[ui.page][Number(homeSlot.dataset.homeSlot)] };
      const dockSlot = icon.closest('[data-dock-slot]');
      if (dockSlot && Number(dockSlot.dataset.dockSlot) !== 2) return { type: 'dock', slot: Number(dockSlot.dataset.dockSlot), id: data.dock[Number(dockSlot.dataset.dockSlot)] };
      if (icon.closest('.drawer-apps')) return { type: 'drawer', id: icon.dataset.app };
      return null;
    }
    function startDrag(x, y) {
      if (!press?.source || dragState) return;
      // Keep touch delivery on the stable screen when a drawer item replaces its view.
      try { screen.setPointerCapture(press.pointerId); } catch {}
      dragState = press.source;
      // Workspace.startDrag hides the original view (GONE) while its DragView moves.
      press.target.closest('.launcher-icon')?.classList.add('drag-source-icon');
      if (dragState.type === 'widget') press.target.closest('.home-widget')?.classList.add('drag-source-widget');
      if (dragState.type === 'widget') {
        const rect = press.target.closest('.home-widget').getBoundingClientRect();
        dragState.grabOffset = {x: press.x - rect.left, y: press.y - rect.top};
      }
      if (dragState.type === 'drawer' || dragState.type === 'drawer-widget') { ui.view = 'home'; ui.overlay = ''; render(); }
      if (dragState.type === 'drawer-widget') {
        const rect = viewport.querySelector('.home-grid:not([inert])').getBoundingClientRect();
        const size = widgetSize(dragState.widgetType);
        dragState.grabOffset = {x: (rect.width - 12) / 4 * size.width / 2, y: (rect.height - 5) / 4 * size.height / 2};
      }
      const ghost = document.createElement('div'); ghost.className = `drag-ghost${dragState.widgetType ? ' widget-ghost' : ''}`; ghost.innerHTML = dragState.widgetType ? widgetArt(dragState.widgetType) : appIcon(dragState.id); screen.append(ghost);
      // Launcher2 drags a widget at its real span: a live copy when moving, the preview image when adding.
      if (dragState.widgetType && dragState.grabOffset) {
        const source = dragState.type === 'widget' ? press.target.closest('.home-widget') : null;
        const grid = viewport.querySelector('.home-grid:not([inert])')?.getBoundingClientRect(), size = widgetSize(dragState.widgetType);
        const box = source ? source.getBoundingClientRect() : grid && {width: (grid.width - 12) / 4 * size.width, height: (grid.height - 5) / 4 * size.height};
        if (box) { ghost.classList.add('widget-span-ghost', `widget-${dragState.widgetType}`); ghost.style.width = `${box.width}px`; ghost.style.height = `${box.height}px`; }
        if (source) { ghost.innerHTML = source.innerHTML; ghost.querySelectorAll('button,[tabindex]').forEach(node => node.setAttribute('tabindex', '-1')); }
      }
      dragState.ghost = ghost;
      if (!dragState.widgetType && !reducedMotion?.matches) ICSTransitions.play(ghost, ICSTransitions.specs['drag-lift'].enter);
      moveGhost(x, y);
      screen.classList.add('dragging');
      screen.classList.toggle('dragging-from-drawer', dragState.type === 'drawer');
      c.suppressClick(500);
    }
    function moveGhost(x, y) {
      if (!dragState) return;
      const rect = screen.getBoundingClientRect();
      const offset = dragState.widgetType ? 65 : 27, grab = dragState.ghost.classList.contains('widget-span-ghost') ? dragState.grabOffset : null;
      dragState.ghost.style.left = `${x - rect.left - (grab ? grab.x : offset)}px`;
      dragState.ghost.style.top = `${y - rect.top - (grab ? grab.y : offset)}px`;
      updateFolderDrag(x,y);
      updateDragOutline(x, y);
      const dropTarget = document.elementFromPoint(x, y)?.closest('[data-drop-remove],[data-drop-info]');
      const removeHover = !!dropTarget?.hasAttribute('data-drop-remove'), infoHover = !!dropTarget?.hasAttribute('data-drop-info') && dragState.type === 'drawer';
      screen.querySelectorAll('.drop-target').forEach(node => node.classList.toggle('drop-hover', node === dropTarget && (removeHover || infoHover)));
      dragState.ghost.classList.toggle('tint-delete', removeHover);
      dragState.ghost.classList.toggle('tint-info', infoHover);
      const direction = ui.overlay ? 0 : x - rect.left < dp(21) ? -1 : rect.right - x < dp(21) ? 1 : 0;
      if (direction !== dragState.edgeDirection) {
        clearTimeout(dragState.edgeTimer);
        dragState.edgeDirection = direction;
        if (direction && y > rect.top + 85 && y < rect.bottom - 120) dragState.edgeTimer = setTimeout(() => {
          if (dragState) { setHomePage(ui.page + direction); dragState.edgeDirection = 0; }
        }, 550);
      }
    }
    /* CellLayout drag outlines: a holo-blue outline marks the cell where the item would land.
       Each outline fades in and out over config_dragOutlineFadeTime (900 ms) to 128/255 alpha, leaving a short trail. */
    function dragOutlineTarget(x, y) {
      const source = dragState;
      if (!source || ui.overlay) return null;
      const target = document.elementFromPoint(x, y), grid = target?.closest('.home-grid:not([inert])');
      if (source.widgetType) {
        if (!grid) return null;
        const rect = grid.getBoundingClientRect(), oldWidget = source.type === 'widget' ? data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
        const column = Math.round((x - rect.left - 6 - source.grabOffset.x) / ((rect.width - 12) / 4)), row = Math.round((y - rect.top - 5 - source.grabOffset.y) / ((rect.height - 5) / 4));
        if (!widgetFits(ui.page, column, row, oldWidget || source.widgetType, oldWidget?.id || '')) return null;
        const size = widgetSize(oldWidget || source.widgetType);
        return {key: `w:${ui.page}:${column}:${row}`, container: grid, style: `grid-column:${column + 1}/span ${size.width};grid-row:${row + 1}/span ${size.height}`};
      }
      const slot = target?.closest('[data-home-slot],[data-dock-slot]');
      if (!slot || slot.querySelector('.launcher-icon:not(.drag-source-icon)')) return null;
      if (slot.hasAttribute('data-home-slot')) {
        const index = Number(slot.dataset.homeSlot);
        if (data.homeWidgets[ui.page].some(widget => index % 4 >= widget.x && index % 4 < widget.x + widgetSize(widget).width && Math.floor(index / 4) >= widget.y && Math.floor(index / 4) < widget.y + widgetSize(widget).height)) return null;
        return {key: `h:${ui.page}:${index}`, container: slot};
      }
      return {key: `d:${slot.dataset.dockSlot}`, container: slot};
    }
    function updateDragOutline(x, y) {
      const target = dragOutlineTarget(x, y), source = dragState;
      if ((target?.key || '') === (source.outlineKey || '')) return;
      source.outlineKey = target?.key || '';
      screen.querySelectorAll('.drag-outline:not(.outline-fading)').forEach(node => { node.classList.add('outline-fading'); setTimeout(() => node.remove(), 900); });
      if (!target) return;
      const outline = document.createElement(source.widgetType ? 'div' : 'span');
      outline.className = source.widgetType ? 'drag-outline widget-outline' : 'drag-outline icon-outline';
      outline.setAttribute('aria-hidden', 'true');
      if (source.widgetType) outline.style.cssText = target.style; else outline.innerHTML = `${appIcon(source.id)}<span class="outline-label">&nbsp;</span>`;
      target.container.append(outline);
      requestAnimationFrame(() => outline.classList.add('outline-visible'));
    }
    const clearDragOutlines = () => screen.querySelectorAll('.drag-outline').forEach(node => node.remove());
    /* DragLayer.animateView: the drag view settles into its final cell (or back to its origin);
       DeleteDropTarget shrinks it into Remove; FolderIcon draws it into the folder preview. */
    function landGhost(ghost, destination, trashRect) {
      const finish = () => ghost.remove();
      if (!destination || reducedMotion?.matches || document.hidden) return finish();
      const screenRect = screen.getBoundingClientRect(), k = screenRect.width / screen.clientWidth || 1;
      const local = rect => ({left: (rect.left - screenRect.left) / k, top: (rect.top - screenRect.top) / k, width: rect.width / k, height: rect.height / k});
      const from = local(ghost.getBoundingClientRect());
      ghost.getAnimations().forEach(animation => animation.cancel());
      Object.assign(ghost.style, {transform: 'none', translate: 'none', transformOrigin: '0 0'});
      const base = local(ghost.getBoundingClientRect());
      let target, options, hidden = null;
      if (destination.trash) {
        if (!trashRect) return finish();
        const bin = local(trashRect), width = from.width * .1, height = from.height * .1;
        target = {left: bin.left + bin.width / 2 - width / 2, top: bin.top + bin.height / 2 - height / 2, width, height};
        options = {duration: 250, motion: 'decelerate2', fade: {to: .1, curve: 'decelerateCubic'}};
      } else {
        const element = dragDestination(destination);
        if (!element) return finish();
        const box = destination.widget ? element : element.querySelector('.app-icon') || element;
        target = local(box.getBoundingClientRect());
        if (!destination.widget && box.classList.contains('launcher-folder-icon') && !ghost.querySelector('.launcher-folder-icon')) {
          const size = target.width * .63;
          target = {left: target.left + target.width / 2 - size / 2, top: target.top + target.height / 2 - size / 2, width: size, height: size};
          options = {duration: 400, motion: 'decelerate2', fade: {to: .5, curve: 'accelerate2'}};
        } else {
          options = {duration: ICSTransitions.dropDuration(Math.hypot(target.left - from.left, target.top - from.top))};
          hidden = element; element.style.visibility = 'hidden';
        }
      }
      const animation = ICSTransitions.fly(ghost, base, from, target, options);
      if (!animation) { finish(); if (hidden) hidden.style.visibility = ''; return; }
      animation.finished.catch(() => {}).then(() => { finish(); if (hidden) hidden.style.visibility = ''; });
    }
    function dragDestination(destination) {
      const grid = page => page === ui.page ? viewport.querySelector(`.home-grid[data-home-page="${page}"]`) : null;
      if (destination.widget) return grid(destination.page)?.querySelector(`.home-widget[data-widget-id="${CSS.escape(destination.widget)}"]`) || null;
      if (destination.type === 'home') return grid(destination.page)?.querySelector(`[data-home-slot="${destination.slot}"] .launcher-icon`) || null;
      if (destination.type === 'dock') return viewport.querySelector(`[data-dock-slot="${destination.slot}"] .launcher-icon`);
      if (destination.type === 'folder') {
        const panel = ui.overlay === 'folder' && ui.folderId === destination.folderId ? overlayRoot.querySelector('.launcher-folder') : null;
        const count = ICSLauncherFolders.folder(data, destination.folderId)?.items.length || 0;
        if (panel) return panel.querySelector(`[data-folder-slot="${Math.min(destination.slot, count - 1)}"] .launcher-icon`);
        return [...viewport.querySelectorAll('[data-folder-id]')].find(button => button.dataset.folderId === destination.folderId && !button.closest('[inert]')) || null;
      }
      return null;
    }
    /* Folder.realTimeReorder: after hovering a cell for 150 ms, icons between the empty cell and the
       target slide over in 230 ms, each starting 30 ms later than the previous (decaying by 0.9). */
    function folderReorder(x, y, panel) {
      const source = dragState, folder = ICSLauncherFolders.folder(data, ui.folderId);
      if (!folder) return;
      const fromHere = source.type === 'folder' && source.folderId === ui.folderId;
      if (!fromHere && folder.items.length >= ICSLauncherFolders.capacity) return;
      const cells = [...panel.querySelectorAll('[data-folder-slot]')];
      const count = Math.min(cells.length, fromHere ? folder.items.length : folder.items.length + 1);
      if (source.reorderPanel !== panel) { source.reorderPanel = panel; source.folderGap = Math.min(fromHere ? source.slot : folder.items.length, count - 1); source.folderGapTarget = source.folderGap; }
      let nearest = 0, distance = Infinity;
      cells.slice(0, count).forEach((cell, index) => { const rect = cell.getBoundingClientRect(), d = Math.hypot(x - rect.left - rect.width / 2, y - rect.top - rect.height / 2); if (d < distance) { distance = d; nearest = index; } });
      if (nearest === source.folderGapTarget) return;
      source.folderGapTarget = nearest;
      clearTimeout(source.reorderTimer);
      source.reorderTimer = setTimeout(() => applyFolderGap(panel, nearest), 150);
    }
    function applyFolderGap(panel, gap) {
      const source = dragState, folder = ICSLauncherFolders.folder(data, ui.folderId);
      if (!source || !folder || source.reorderPanel !== panel || !panel.isConnected) return;
      const fromHere = source.type === 'folder' && source.folderId === ui.folderId, previous = source.folderGap;
      const cells = [...panel.querySelectorAll('[data-folder-slot]')], rects = cells.map(cell => cell.getBoundingClientRect());
      const k = screen.getBoundingClientRect().width / screen.clientWidth || 1;
      const remaining = folder.items.map((_, slot) => slot).filter(slot => !(fromHere && slot === source.slot));
      const moves = remaining.map((slot, order) => ({slot, from: order >= previous ? order + 1 : order, to: order >= gap ? order + 1 : order})).filter(move => move.from !== move.to && rects[move.to]);
      moves.sort((a, b) => Math.abs(a.from - previous) - Math.abs(b.from - previous));
      let delay = 0, step = 30;
      for (const move of moves) {
        const icon = cells[move.slot]?.querySelector('.launcher-icon');
        if (!icon) continue;
        const dx = (rects[move.to].left - rects[move.slot].left) / k, dy = (rects[move.to].top - rects[move.slot].top) / k;
        icon.style.transition = reducedMotion?.matches ? 'none' : `transform 230ms cubic-bezier(.37,0,.63,1) ${Math.round(delay)}ms`;
        icon.style.transform = dx || dy ? `translate(${dx}px,${dy}px)` : '';
        delay += step; step *= .9;
      }
      source.folderGap = gap;
    }
    function clearFolderDragFeedback(){screen.querySelectorAll('.folder-drop-target,.folder-reorder-target,.drag-source-icon,.drag-source-widget').forEach(node=>node.classList.remove('folder-drop-target','folder-reorder-target','drag-source-icon','drag-source-widget'));}
    function updateFolderDrag(x,y) {
      const source=dragState;if(!source||source.widgetType)return;
      screen.querySelectorAll('.folder-drop-target,.folder-reorder-target').forEach(node=>node.classList.remove('folder-drop-target','folder-reorder-target'));
      const target=document.elementFromPoint(x,y),panel=overlayRoot.querySelector('.launcher-folder');
      if(panel){
        const rect=panel.getBoundingClientRect(),inside=x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;
        if(!inside&&!source.folderExitTimer)source.folderExitTimer=setTimeout(()=>{if(dragState===source){ui.overlay='';renderOverlay();source.folderExitTimer=null;source.hoverFolder=null;}},800);
        else if(inside){clearTimeout(source.folderExitTimer);source.folderExitTimer=null;folderReorder(x,y,panel);}
        return;
      }
      const slot=target?.closest('[data-home-slot],[data-dock-slot]'),icon=slot?.querySelector('.launcher-icon');
      const sourceIsFolder=!!ICSLauncherFolders.folder(data,source.id);
      const sameSlot=slot&&(slot.hasAttribute('data-home-slot')?source.type==='home'&&source.page===ui.page&&source.slot===Number(slot.dataset.homeSlot):source.type==='dock'&&source.slot===Number(slot.dataset.dockSlot));
      const folderId=icon?.dataset.folderId;
      if(icon&&!sameSlot&&!sourceIsFolder&&icon.dataset.action!=='drawer')icon.classList.add('folder-drop-target');
      const hoverId=!sourceIsFolder&&!sameSlot?folderId:null;
      if(hoverId!==source.hoverFolder){
        clearTimeout(source.folderHoverTimer);source.hoverFolder=hoverId;
        if(hoverId)source.folderHoverTimer=setTimeout(()=>{if(dragState===source&&ICSLauncherFolders.folder(data,hoverId)?.items.length<ICSLauncherFolders.capacity){ui.folderId=hoverId;ui.overlay='folder';renderOverlay();}},700);
      }
    }
    function finishDrag(x, y) {
      if (!dragState) return false;
      const source = dragState;
      let target = document.elementFromPoint(x, y);
      if(ui.overlay==='folder'&&!target?.closest('.launcher-folder')){ui.overlay='';renderOverlay();target=document.elementFromPoint(x,y);}
      const folderSlot=target?.closest('[data-folder-slot]');
      let homeSlot = target?.closest('[data-home-slot]');
      const grid = target?.closest('.home-grid');
      if (!homeSlot && grid) {
        const rect = grid.getBoundingClientRect();
        const column = Math.min(3, Math.max(0, Math.floor((x - rect.left) / rect.width * 4)));
        const row = Math.min(3, Math.max(0, Math.floor((y - rect.top) / rect.height * 4)));
        homeSlot = grid.querySelector(`[data-home-slot="${row * 4 + column}"]`);
      }
      const dockSlot = target?.closest('[data-dock-slot]');
      const pageButton = target?.closest('.page-indicators button');
      const remove = target?.closest('[data-drop-remove]');
      const trashRect = remove?.getBoundingClientRect();
      if (source.type === 'drawer' && target?.closest('[data-drop-info]')) {
        clearTimeout(source.edgeTimer); clearDragOutlines(); source.ghost.remove(); dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer');
        openApp('settings'); ui.settingsApp = source.id; ui.sub = 'app-info'; render(); c.suppressClick(350);
        return true;
      }
      let destination = null;
      if (source.widgetType) {
        const oldWidget = source.type === 'widget' ? data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
        if (oldWidget) destination = {widget: oldWidget.id, page: source.page};
        if (remove && oldWidget) { data.homeWidgets[source.page] = data.homeWidgets[source.page].filter(widget => widget.id !== source.id); destination = {trash: true}; }
        else if (homeSlot) {
          const rect = homeSlot.closest('.home-grid').getBoundingClientRect();
          const column = Math.round((x - rect.left - 6 - source.grabOffset.x) / ((rect.width - 12) / 4));
          const row = Math.round((y - rect.top - 5 - source.grabOffset.y) / ((rect.height - 5) / 4));
          if (widgetFits(ui.page, column, row, oldWidget || source.widgetType, oldWidget?.id || '')) {
            if (oldWidget) {
              data.homeWidgets[source.page] = data.homeWidgets[source.page].filter(widget => widget.id !== source.id);
              oldWidget.x = column; oldWidget.y = row;
              data.homeWidgets[ui.page].push(oldWidget);
              destination = {widget: oldWidget.id, page: ui.page};
            }
            else { const added = addWidget(source.widgetType, column, row); if (added) destination = {widget: added.id, page: ui.page}; }
          } else toast('This home screen is full');
        }
      } else {
        let result=null,attempt=null;
        const dropAt=location=>{attempt=location;return ICSLauncherFolders.drop(data,source,location);};
        if(remove)result={ok:ICSLauncherFolders.remove(data,source)};
        else if((folderSlot||target?.closest('.launcher-folder-grid'))&&source.reorderPanel&&source.reorderPanel===overlayRoot.querySelector('.launcher-folder'))result=dropAt({type:'folder',folderId:ui.folderId,slot:source.folderGap});
        else if(folderSlot)result=dropAt({type:'folder',folderId:ui.folderId,slot:Number(folderSlot.dataset.folderSlot)});
        else if(target?.closest('.launcher-folder-grid'))result=dropAt({type:'folder',folderId:ui.folderId,slot:ICSLauncherFolders.folder(data,ui.folderId).items.length});
        else if(homeSlot){
          const slot=Number(homeSlot.dataset.homeSlot);
          const covered=data.homeWidgets[ui.page].some(widget=>slot%4>=widget.x&&slot%4<widget.x+widgetSize(widget).width&&Math.floor(slot/4)>=widget.y&&Math.floor(slot/4)<widget.y+widgetSize(widget).height);
          const occupant=data.homePages[ui.page][slot],folderTarget=occupant&&ICSLauncherFolders.folder(data,occupant);
          const own=source.type==='home'&&source.page===ui.page&&source.slot===slot;
          if(folderTarget&&!own)result=dropAt({type:'folder',folderId:occupant,slot:folderTarget.items.length});
          else if(!covered&&(!occupant||own))result=dropAt({type:'home',page:ui.page,slot});
          else{
            const vacant=index=>(data.homePages[ui.page][index]===null||source.type==='home'&&source.page===ui.page&&source.slot===index)&&!data.homeWidgets[ui.page].some(widget=>index%4>=widget.x&&index%4<widget.x+widgetSize(widget).width&&Math.floor(index/4)>=widget.y&&Math.floor(index/4)<widget.y+widgetSize(widget).height);
            const nearest=Array.from({length:16},(_,index)=>index).filter(vacant).sort((a,b)=>Math.hypot(a%4-slot%4,Math.floor(a/4)-Math.floor(slot/4))-Math.hypot(b%4-slot%4,Math.floor(b/4)-Math.floor(slot/4)))[0];
            result=nearest===undefined?{ok:false,error:'No more room on this Home screen.'}:dropAt({type:'home',page:ui.page,slot:nearest});
          }
        }else if(dockSlot)result=dropAt({type:'dock',slot:Number(dockSlot.dataset.dockSlot)});
        else if(pageButton){
          const nextPage=Number(pageButton.dataset.id);
          const slot=data.homePages[nextPage].findIndex((id,index)=>id===null&&!data.homeWidgets[nextPage].some(widget=>index%4>=widget.x&&index%4<widget.x+widgetSize(widget).width&&Math.floor(index/4)>=widget.y&&Math.floor(index/4)<widget.y+widgetSize(widget).height));
          if(slot>=0){result=dropAt({type:'home',page:nextPage,slot});if(result.ok)ui.page=nextPage;}
          else result={ok:false,error:'This home screen is full'};
        }
        if(result?.error)toast(result.error);
        if(ui.overlay==='folder'&&!ICSLauncherFolders.folder(data,ui.folderId))ui.overlay='';
        // A folder that received the item may now sit where the target icon was.
        if(remove&&result?.ok)destination={trash:true};
        else if(result?.ok&&attempt)destination=attempt;
        else if(['home','dock','folder'].includes(source.type))destination=source;
      }
      clearTimeout(source.folderExitTimer);clearTimeout(source.folderHoverTimer);clearTimeout(source.reorderTimer);clearFolderDragFeedback();
      clearTimeout(source.edgeTimer); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer');
      save(); render(); c.suppressClick(350);
      landGhost(source.ghost, destination, trashRect);
      return true;
    }
    function setHomePage(page) {
      ui.page = Math.max(0, Math.min(4, page));
      const track = viewport.querySelector('.home-pages');
      if (!track) return;
      track.style.transition = '';
      track.style.transform = `translateX(${-ui.page * 100}%)`; snapResting(track);
      tweenWallpaperOffset(ui.page / 4);
      if (data.wallpaper !== 99) { screen.style.transition = 'background-position .35s cubic-bezier(.16,1,.3,1)'; screen.style.backgroundPositionX = `${ui.page * 25}%`; }
      track.querySelectorAll('.home-grid').forEach((grid, index) => { grid.inert = index !== ui.page; });
      // Launcher.updateArrows: the previous/next buttons show one dot per screen on that side.
      const home = viewport.querySelector('.home-view.gbl');
      if (home) { home.querySelectorAll('.gbl-arrow').forEach(node => node.remove()); home.querySelector('.gbl-cluster')?.insertAdjacentHTML('beforebegin', GBLauncher.arrows(ui.page, 5, key => i18n.t(key))); }
      screen.classList.add('show-page-indicator');
      clearTimeout(ui.pageIndicatorTimer);
      ui.pageIndicatorTimer = setTimeout(() => screen.classList.remove('show-page-indicator'), 800);
    }
    function moveHomePage(dx) {
      const content = viewport.querySelector('.home-pages');
      if (!content) return;
      const distance = Math.max(-(4 - ui.page) * screen.clientWidth, Math.min(ui.page * screen.clientWidth, dx));
      content.style.transition = 'none';
      content.style.transform = `translateX(calc(${-ui.page * 100}% + ${distance}px))`;
      const liveWallpaper = c.liveWallpaper();
      if (liveWallpaper) { const value = (ui.page - distance / screen.clientWidth) / 4; liveWallpaper.setOffset(value); liveWallpaper.offset = value; }
    }
    function finishHomePage(dx) {
      const nextPage = Math.max(0, Math.min(4, ui.page + (dx < 0 ? 1 : -1)));
      screen.classList.remove('page-swiping');
      c.suppressClick(350);
      setHomePage(Math.abs(dx) > dp(52) ? nextPage : ui.page);
    }
    function finishDrawerPage(dx) {
      const pageCount = ui.drawerTab === 'apps' ? Math.ceil(apps.length / 20) : Math.ceil(widgetTypes.length / 4);
      const nextPage = Math.max(0,Math.min(pageCount - 1,ui.drawerPage + (dx < 0 ? 1 : -1)));
      c.suppressClick(350);
      if (Math.abs(dx) > dp(52) && nextPage !== ui.drawerPage) {
        ui.drawerPage = nextPage; render();
        viewport.querySelector('.drawer-page')?.animate([{transform:`translateX(${dx < 0 ? '100%' : '-100%'})`,opacity:.5},{transform:'translateX(0)',opacity:1}],{duration:210,easing:'ease-out'});
      } else {
        const page = viewport.querySelector('.drawer-page');
        if (page) { page.style.transition = 'transform .18s ease-out'; page.style.transform = ''; }
      }
    }
    return {data, ui, save, render, renderOverlay, toast, openApp, screen, viewport, overlayRoot, dp, apps, widgetTypes, widgetSize, launcherMenu, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, cancelPhotoWidget, musicActive, fillPreviews, syncFolderIcons, renderFolder, positionFolder, restoreWidgetScroll, dragSource, startDrag, moveGhost, clearDragOutlines, clearFolderDragFeedback, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage};
  }
  // The gestures on the home screen, the drawer and an open folder (Launcher2's DragController, Workspace and AllApps2D).
  function init(core) {
    const {screen, viewport, overlayRoot} = core;
    screen.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const c = core.live(), {data, ui, renderOverlay, dragSource, startDrag} = shell(c);
      const widgetList = ui.view === 'home' && !ui.overlay ? event.target.closest('.calw-list') : null;
      press = { x: event.clientX, y: event.clientY, target: event.target, source: dragSource(event.target), pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget: widgetList, scrollTop: widgetList?.scrollTop || 0, pageSwipeEligible: ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'), drawerSwipeEligible: ui.view === 'drawer' && !!event.target.closest('.drawer-page') };
      if (ui.view === 'home' && !ui.overlay && event.target.closest('.home-slot') && !press.source) homeLongPressTimer = setTimeout(() => { ui.overlay = 'wallpaper-source'; renderOverlay(); press = null; c.suppressRelease(); }, 550);
      if (ui.view === 'home' && !ui.overlay) press.photoStack = event.target.closest('[data-photo-stack]')?.dataset.photoStack || '';
      if (press.source) dragTimer = setTimeout(() => startDrag(event.clientX, event.clientY), 440);
    });
    window.addEventListener('pointermove', event => {
      if (!press || event.pointerId !== press.pointerId) return;
      const c = core.live(), {ui, screen, viewport, dp, moveGhost, moveHomePage, startDrag} = shell(c);
      if (dragState) { moveGhost(event.clientX, event.clientY); return; }
      const dx = event.clientX - press.x, dy = event.clientY - press.y;
      if (Math.hypot(dx,dy) > 8) clearTimeout(homeLongPressTimer);
      if (press.drawerSwipeEligible && (press.drawerSwiping || Math.abs(dx) > dp(14) && Math.abs(dx) > Math.abs(dy) * 1.1 && performance.now() - press.downTime < 260)) {
        press.drawerSwiping = true;
        clearTimeout(dragTimer);
        event.preventDefault();
        try { screen.setPointerCapture(event.pointerId); } catch {}
        const page = viewport.querySelector('.drawer-page');
        if (page) { page.style.transition = 'none'; page.style.transform = `translateX(${Math.max(-screen.clientWidth*.65,Math.min(screen.clientWidth*.65,dx))}px)`; }
        return;
      }
      // StackView: a vertical fling on the front picture moves through the stack.
      if (press.photoStack && (press.photoSwiping || Math.abs(dy) > dp(7) && Math.abs(dy) > Math.abs(dx) * 1.2)) {
        if (!press.photoSwiping) { press.photoSwiping = true; clearTimeout(dragTimer); c.suppressClick(350); try { screen.setPointerCapture(event.pointerId); } catch {} }
        event.preventDefault();
        const front = viewport.querySelector(`[data-photo-stack="${CSS.escape(press.photoStack)}"] .phw-front`);
        if (front) { front.style.transition = 'none'; front.style.transform = `translateY(${Math.max(-60, Math.min(90, dy))}px) rotate(${Math.max(-6, Math.min(6, dy / 15))}deg)`; front.style.opacity = String(Math.max(.35, 1 - Math.abs(dy) / 160)); }
        return;
      }
      if (press.scrolling) { event.preventDefault(); press.scrollTarget.scrollTop = press.scrollTop - dy; return; }
      if (press.scrollTarget && Math.abs(dy) > dp(7) && Math.abs(dy) > Math.abs(dx)) {
        clearTimeout(dragTimer);
        press.scrolling = true; screen.classList.add('settings-scrolling');
        try { screen.setPointerCapture(event.pointerId); } catch {}
        c.suppressClick(350);
        event.preventDefault(); press.scrollTarget.scrollTop = press.scrollTop - dy; return;
      }
      if (press.swiping) { event.preventDefault(); moveHomePage(dx); return; }
      const distance = Math.hypot(dx, dy);
      if (distance > 9) clearTimeout(dragTimer);
      const horizontal = Math.abs(dx) > Math.abs(dy) * 1.1;
      const quickHomeIcon = ['home','widget'].includes(press.source?.type) && performance.now() - press.downTime < 260;
      if (press.pageSwipeEligible && horizontal && Math.abs(dx) > (press.source ? 28 : 10) && (!press.source || quickHomeIcon)) {
        press.swiping = true;
        screen.classList.add('page-swiping');
        try { screen.setPointerCapture(event.pointerId); } catch {}
        c.suppressClick(350);
        event.preventDefault();
        moveHomePage(dx);
        return;
      }
      if (press.source && event.pointerType === 'mouse' && distance > 8 && !(quickHomeIcon && horizontal)) startDrag(event.clientX, event.clientY);
    });
    window.addEventListener('pointerup', event => {
      if (!press || event.pointerId !== press.pointerId) return;
      const c = core.live(), {ui, screen, dp, render, stepPhotoStack, finishDrawerPage, finishHomePage, startDrag, finishDrag} = shell(c);
      clearTimeout(dragTimer); clearTimeout(homeLongPressTimer);
      const dx = event.clientX - press.x, dy = event.clientY - press.y;
      if (press.photoSwiping) { if (Math.abs(dy) > dp(35)) stepPhotoStack(press.photoStack, dy > 0 ? 1 : -1); else render(); c.suppressClick(350); press = null; return; }
      if (press.drawerSwiping) { finishDrawerPage(dx); press = null; return; }
      if (press.scrolling) { screen.classList.remove('settings-scrolling'); c.suppressClick(350); press = null; return; }
      if (press.swiping || press.pageSwipeEligible && !dragState && Math.abs(dx) > dp(52) && Math.abs(dx) > Math.abs(dy) && (!press.source || press.source.type === 'home' && performance.now() - press.downTime < 260)) {
        finishHomePage(dx); press = null; return;
      }
      if (!dragState && press?.source && !['drawer', 'drawer-widget'].includes(press.source.type) && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 9) startDrag(event.clientX, event.clientY);
      if (finishDrag(event.clientX, event.clientY)) { press = null; return; }
      if (!press) return;
      press = null;
    });
    window.addEventListener('pointercancel', () => {
      const c = core.live(), {ui, screen, viewport, renderOverlay, clearFolderDragFeedback, clearDragOutlines, setHomePage} = shell(c);
      clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer);clearTimeout(dragState?.folderExitTimer);clearTimeout(dragState?.folderHoverTimer);clearFolderDragFeedback();dragState?.ghost.remove(); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling'); setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; if (ui.overlay === 'folder') renderOverlay(); press = null;
    });
    // Older WebKit versions may still start page rubber-banding during an icon's drag.
    screen.addEventListener('touchmove', event => {
      if (event.touches.length !== 1 || !press || event.target.closest('input, textarea, select')) return;
      if (press.source && event.cancelable) event.preventDefault();
    }, { passive: false });
    // A right click on an empty cell: Select wallpaper from.
    screen.addEventListener('contextmenu', event => {
      if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const {ui, renderOverlay} = shell(core.live());
      if (!dragState && ui.view === 'home' && !ui.overlay && event.button === 2 && event.target.closest('.home-slot') && !event.target.closest('.launcher-icon')) { ui.overlay = 'wallpaper-source'; renderOverlay(); }
    });
    let lastWheelPage = 0;
    screen.addEventListener('wheel', event => {
      const c = core.live(), {ui, stepPhotoStack, setHomePage} = shell(c);
      if (ui.view !== 'home' || ui.overlay || dragState || !event.target.closest('.home-content')) return;
      const widgetList = event.target.closest('.calw-list');
      if (widgetList && Math.abs(event.deltaY) > Math.abs(event.deltaX) && widgetList.scrollHeight > widgetList.clientHeight) return;
      event.preventDefault();
      const stack = event.target.closest('[data-photo-stack]');
      if (stack && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        if (Math.abs(event.deltaY) >= 8 && performance.now() - lastWheelPage >= 300) { lastWheelPage = performance.now(); stepPhotoStack(stack.dataset.photoStack, event.deltaY > 0 ? 1 : -1); }
        return;
      }
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 8 || performance.now() - lastWheelPage < 300) return;
      lastWheelPage = performance.now();
      setHomePage(ui.page + Math.sign(delta));
    }, {passive:false});
    let previewHold = 0;
    viewport.addEventListener('pointerdown', event => {
      const {data, ui, renderOverlay} = shell(core.live());
      const anchor = event.target.closest('.gbl-arrow,.gbl-allapps'); if (!anchor || event.button || ui.view !== 'home') return;
      clearTimeout(previewHold);
      previewHold = setTimeout(() => {
        const swallow = click => { click.stopPropagation(); click.preventDefault(); window.removeEventListener('click', swallow, true); };
        window.addEventListener('click', swallow, true); setTimeout(() => window.removeEventListener('click', swallow, true), 600);
        if (data.settings.haptic !== false) navigator.vibrate?.(30);
        ui.gbPreviewAnchor = anchor.classList.contains('gbl-allapps') ? 'apps' : anchor.classList.contains('gbl-arrow-right') ? 'next' : 'previous';
        ui.overlay = 'gb-previews'; renderOverlay();
      }, 500);
    });
    for (const type of ['pointerup', 'pointercancel', 'pointerleave']) viewport.addEventListener(type, () => clearTimeout(previewHold));
    let folderTitleHold = 0;
    overlayRoot.addEventListener('pointerdown', event => {
      if (!event.target.closest('[data-gb-folder-title]') || event.button) return;
      const {data, ui, renderOverlay} = shell(core.live());
      clearTimeout(folderTitleHold);
      folderTitleHold = setTimeout(() => {
        const swallow = click => { click.stopPropagation(); click.preventDefault(); window.removeEventListener('click', swallow, true); };
        window.addEventListener('click', swallow, true); setTimeout(() => window.removeEventListener('click', swallow, true), 600);
        if (ICSLauncherFolders.folder(data, ui.folderId)?.live) return;
        ui.overlay = 'gb-dialog-rename'; renderOverlay(); overlayRoot.querySelector('.gbdlg input')?.select();
      }, 500);
    });
    for (const type of ['pointerup', 'pointercancel', 'pointerleave']) overlayRoot.addEventListener(type, () => clearTimeout(folderTitleHold));
    window.addEventListener('resize',()=>{const {ui, positionFolder} = shell(core.live());if(ui.overlay==='folder')positionFolder();});
  }
  const home = {
    init,
    dragging: () => !!dragState,
    cancelPhotoWidget: c => shell(c).cancelPhotoWidget(),
    render: c => shell(c).renderHome(),
    // The widgets' list positions come back after a render.
    mount: c => shell(c).restoreWidgetScroll(),
    // Launcher.onCreateOptionsMenu (not over a folder or a dialog).
    menu(c) { const {ui, renderOverlay} = c; if (ui.overlay) return; ui.overlay = 'gb-menu-home'; renderOverlay(); },
    // Launcher AddAdapter ("Add to Home screen"), the shortcut and widget pickers, the folders and "Select wallpaper from".
    dialog(kind, c) {
      const {data, ui, apps, widgetTypes} = shell(c), t = key => i18n.t(key), safe = c.safe;
      if (kind === 'add') return {title: t('Add to Home screen'), items: [
        {action: 'gb-add-shortcuts', title: t('Shortcuts'), icon: 'l2-ic_launcher_shortcut'},
        {action: 'gb-add-widgets', title: t('Widgets'), icon: 'l2-ic_launcher_appwidget'},
        {action: 'gb-add-folders', title: t('Folders'), icon: 'l2-ic_launcher_folder'},
        {action: 'gb-wallpaper', title: t('Wallpapers'), icon: 'l2-ic_launcher_wallpaper'}]};
      if (kind === 'shortcuts') return {title: t('Select shortcut'), items: [...apps].sort((a, b) => t(a[1]).localeCompare(t(b[1]), i18n.locale())).map(app => ({action: 'gb-add-app', id: app[0], title: t(app[1]), icon: `${app[0]}.png`}))};
      if (kind === 'widgets') return {title: t('Choose widget'), items: [...widgetTypes].sort((a, b) => t(a.name).localeCompare(t(b.name), i18n.locale())).map(widget => ({action: 'add-widget-gb', id: widget.type, title: t(widget.name), icon: `${widget.app || 'settings'}.png`}))};
      if (kind === 'folders') return {title: t('Select folder'), items: [
        {action: 'gb-new-folder', title: t('New folder'), icon: 'l2-ic_launcher_folder'},
        {action: 'gb-new-folder', id: 'all', title: t('All contacts'), icon: 'ic_launcher_folder_live_contacts'},
        {action: 'gb-new-folder', id: 'phone', title: t('Contacts with phone numbers'), icon: 'ic_launcher_folder_live_contacts_phone'},
        {action: 'gb-new-folder', id: 'starred', title: t('Starred contacts'), icon: 'ic_launcher_folder_live_contacts_starred'}]};
      if (kind === 'rename') return {title: t('Rename folder'), custom: `<label class="gbdlg-field"><span>${safe(t('Folder name'))}</span><input maxlength="40" value="${safe(ICSLauncherFolders.folder(data, ui.folderId)?.name || t('Folder'))}"></label>`, buttons: [{action: 'gb-rename-folder', title: t('OK')}, {action: 'gb-rename-cancel', title: t('Cancel')}], cancel: 'gb-rename-cancel'};
      if (kind === 'wallpaper') return {title: t('Select wallpaper from'), items: [
        {action: 'open-app', app: 'gallery', title: t('Gallery'), icon: 'gallery.png'},
        {action: 'open-live-wallpapers', title: t('Live wallpapers'), icon: 'gb-l2-ic_launcher_wallpaper.png'},
        {action: 'open-wallpapers', title: t('Wallpapers'), icon: 'l2-ic_launcher_wallpaper'}]};
      return {title: '', items: []};
    },
    // The previews of the five screens, the options menu, the inherited ICS wallpaper chooser and an open folder.
    overlay(c, overlayRoot) {
      const {data, ui, fillPreviews, launcherMenu, renderFolder, positionFolder, syncFolderIcons} = shell(c), safe = c.safe;
      if (ui.overlay === 'gb-previews') {
        overlayRoot.innerHTML = `<div class="gbprev-scrim" data-action="close-overlay"></div><div class="gbprev" role="listbox" aria-label="${safe(i18n.t('Home screen'))}">${data.homePages.map((_, index) => `<button class="gbprev-item${index === ui.page ? ' current' : ''}" role="option" aria-selected="${index === ui.page}" data-action="gb-preview-go" data-id="${index}" aria-label="${safe(i18n.t('Home screen'))} ${index + 1}"><span class="gbprev-thumb"></span></button>`).join('')}</div>`;
        fillPreviews();
      } else if (ui.overlay === 'gb-menu-home') {
        ui.gbMenuItems = launcherMenu();
        overlayRoot.innerHTML = GBUI.menu(ui.gbMenuItems, key => i18n.t(key));
      } else if (ui.overlay === 'wallpaper-source') {
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="wallpaper-source" role="dialog" aria-label="Select wallpaper from"><h3>Select wallpaper from</h3>${[['gallery-wallpaper', 'Gallery'], ['open-live-wallpapers', 'Live Wallpapers'], ['open-wallpapers', 'Wallpapers']].sort((a, b) => new Intl.Collator(i18n.locale()).compare(i18n.t(a[1]), i18n.t(b[1]))).map(([action, label]) => `<button data-action="${action}" data-no-translate>${safe(i18n.t(label))}</button>`).join('')}</div>`;
      } else if (ui.overlay === 'folder') {
        overlayRoot.innerHTML = renderFolder();
        positionFolder();
        syncFolderIcons();
      }
    },
    afterOverlay(c, closingFolder) {
      const {ui, overlayRoot, syncFolderIcons} = shell(c);
      // Folder.animateOpen/animateClosed run only when the folder actually opens or closes, not on content updates.
      const folderPanel = ui.overlay === 'folder' ? overlayRoot.querySelector('.launcher-folder') : null;
      if (folderPanel && openFolderId !== ui.folderId) {
        ui.folderSettled = '';
        const animations = ICSTransitions.play(folderPanel, ICSTransitions.specs['folder-open'].enter);
        animations.forEach(animation => animation.finished.then(() => animation.cancel(), () => {}));
        const folderId = ui.folderId;
        Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => { if (ui.overlay === 'folder' && ui.folderId === folderId) { ui.folderSettled = folderId; } });
      }
      if (!folderPanel && closingFolder && openFolderId) {
        closingFolder.inert = true; closingFolder.classList.add('launcher-folder-closing'); overlayRoot.append(closingFolder);
        const animations = ICSTransitions.play(closingFolder, ICSTransitions.specs['folder-close'].exit);
        Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => closingFolder.remove());
        if (!animations.length) closingFolder.remove();
      }
      if (!folderPanel && openFolderId) syncFolderIcons();
      openFolderId = folderPanel ? ui.folderId : '';
      if (!folderPanel) ui.folderSettled = '';
    },
    // A focused photo stack steps with the arrow keys.
    key(event, c) {
      const {ui, viewport, stepPhotoStack} = shell(c);
      const focusedStack = ui.view === 'home' && !ui.overlay && document.activeElement?.closest?.('[data-photo-stack]');
      if (focusedStack && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); const id = focusedStack.dataset.photoStack; stepPhotoStack(id, event.key === 'ArrowDown' ? 1 : -1); viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"] .phw-front`)?.focus(); return true; }
      return false;
    },
    // The calendar widget follows the minute.
    tick(c) {
      const {ui, viewport, render} = c, now = c.deviceDate();
      const minute = stamp => `${stamp.toDateString()} ${stamp.getHours()}:${stamp.getMinutes()}`;
      if (minute(now) !== lastWidgetMinute) {
        lastWidgetMinute = minute(now);
        if (ui.view === 'home' && !ui.overlay && !c.pressing() && !dragState && viewport.querySelector('.calw')) render();
      }
    },
    action(name, el, c) {
      const id = el.dataset.id, action = name, button = el, {data, ui, save, render, renderOverlay, toast, openApp, viewport, overlayRoot, widgetFits, addWidget, musicActive, setHomePage} = shell(c), tracks = ICSMusic.tracks, saveMusic = c.saveMusic, gbMarketGo = next => GB.module('play-store').go(c, next), gappContext = c.gapp, deviceDate = c.deviceDate, navigateBrowser = c.navigateBrowser, openSearch = c.openSearch, blinkTips = c.blinkTips, today = c.today;
      switch (name) {
        case 'drawer': ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; render(); break;
        case 'folder-open': ui.folderId=button.dataset.folderId;ui.overlay='folder';renderOverlay();break;
        case 'drawer-page': ui.drawerPage = Number(id); render(); break;
        case 'widget-calendar-open': ui.selectedDate = today(); openApp('calendar'); break;
        case 'widget-calendar-event': { const event = data.events.find(item => String(item.id) === id); if (!event) break; const date = button.dataset.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render(); break; }
        case 'widget-music-open': { const active = musicActive(); openApp('music'); if (active) { ui.sub = 'player'; render(); } break; }
        case 'widget-music-next': ICSMusic.step(ui.music, 1); ui.musicActive = true; ui.musicTrack = ui.music.track; saveMusic(); render(); break;
        case 'widget-photo-open': { const photo = data.photos.find(item => item.id === Number(id)); if (!photo) break; openApp('gallery'); ui.selectedPhoto = photo.id; ui.galleryAlbum = ICSMedia.album(photo); ui.sub = 'photo'; ui.galleryZoom = false; render(); break; }
        case 'open-wallpapers': ui.overlay = ''; ui.wpChoice = null; ui.view = 'wallpaper-picker'; render(); viewport.querySelector('.gbwp-item.selected')?.scrollIntoView({inline: 'center', block: 'nearest'}); break;
        case 'open-live-wallpapers': ui.overlay = ''; ui.view = 'live-wallpapers'; ui.sub = ''; render(); break;
        case 'gallery-wallpaper': ui.overlay = ''; openApp('gallery'); break;
        // The Google apps' home screen widgets open their story, video or app.
        case 'gbw-news': openApp('news-weather'); if (id !== 'weather') { ui.nwTab = 'Top Stories'; ui.nwStory = id; } render(); break;
        case 'gbw-youtube': openApp('youtube'); Object.assign(ui, {ytWatch: id, ytTab: 'info', ytPos: 0, ytPlaying: true}); render(); break;
        case 'gbw-youtube-search': openApp('youtube'); ui.ytSearching = true; render(); viewport.querySelector('.yt-search input')?.focus(); break;
        case 'gbw-market': openApp('play-store'); gbMarketGo({page: 'detail', selected: id}); break;
        case 'gbw-latitude':
          if (id === 'checkin') { data.latitudeCheckin = 'Riverside Park'; save(); toast(`${i18n.t('Check in')}: Riverside Park`); render(); }
          else if (id === 'refresh') { data.latitudeUpdated = deviceDate().getTime(); save(); render(); }
          else openApp('latitude');
          break;
        case 'gbw-traffic': openApp('maps'); break;
        // Rate Places: the rate panel slides in over the place; a star rates the place and slides it back.
        case 'gbw-hotpot':
          if (id === 'places') { ui.overlay = 'gb-dialog-hotpot'; renderOverlay(); break; }
          ui.gbwHotpot = id === 'rate' ? 'rate' : ''; ui.gbwHotpotSlide = true; render(); ui.gbwHotpotSlide = false; break;
        case 'gbw-hotpot-star': { const [place, stars] = id.split(':'); const hp = data.hotpot ||= {}; (hp.ratings ||= {})[place] = Number(stars); ui.gbwHotpot = ''; ui.gbwHotpotSlide = true; save(); render(); ui.gbwHotpotSlide = false; break; }
        case 'gbw-hotpot-more': ui.gbwHotpot = ''; openApp('places'); if (ui.mp) { ui.mp.page = id; render(); } break;
        case 'gbw-hotpot-pick': data.hotpot = {...data.hotpot, place: id, updated: deviceDate().getTime()}; ui.overlay = ''; renderOverlay(); save(); render(); break;
        case 'gbw-voice-step': ui.gbwVoice = (ui.gbwVoice || 0) + Number(id); render(); break;
        case 'gbw-voice-open': openApp('google-voice'); if (id) { const c = GBExtraApps.gvStore(data).find(x => x.id === id); if (c) { c.read = true; ui.gvOpen = id; save(); } } render(); break;
        case 'gbw-voice-compose': openApp('google-voice'); render(); gappContext().dialog('gv-compose'); break;
        case 'gbw-voice-dnd': data.gvoiceDnd = !data.gvoiceDnd; save(); toast(GBGoogleWidgets.T(i18n.language, data.gvoiceDnd ? 'Do not disturb on' : 'Do not disturb off')); render(); break;
        case 'page': setHomePage(Number(id)); break;
        case 'power-toggle':
          if (id === 'brightness') { const auto = data.settings.autoBrightness ?? GBSettings.DEFAULTS.autoBrightness; if (auto) { data.settings.autoBrightness = false; data.settings.brightness = 20; } else if ((data.settings.brightness ?? 60) < 30) data.settings.brightness = 55; else if (data.settings.brightness < 80) data.settings.brightness = 100; else data.settings.autoBrightness = true; }
          else data.settings[id] = !data.settings[id];
          if(id==='wifi'&&data.settings.wifi)data.settings.portableHotspot=false;
          if(id==='bluetooth'&&!data.settings.bluetooth)data.settings.bluetoothTether=false;
          save(); render(); break;
        case 'widget-music-play': ui.musicActive=true;ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
        case 'gb-add': ui.overlay = 'gb-dialog-add'; renderOverlay(); break;
        case 'gb-add-shortcuts': ui.overlay = 'gb-dialog-shortcuts'; renderOverlay(); break;
        case 'gb-add-widgets': ui.overlay = 'gb-dialog-widgets'; renderOverlay(); break;
        case 'gb-add-folders': ui.overlay = 'gb-dialog-folders'; renderOverlay(); break;
        case 'gb-new-folder': { ui.overlay = ''; const slot = data.homePages[ui.page].findIndex((item, index) => item === null && widgetFits(ui.page, index % 4, Math.floor(index / 4), {type: 'x', width: 1, height: 1})); if (slot < 0) { renderOverlay(); toast('No more room on this Home screen.'); break; } ICSLauncherFolders.create(data, ui.page, slot, id ? {live: id} : {}); save(); render(); break; }
        case 'gb-live-contact': ui.overlay = ''; openApp('people'); ui.selectedContact = Number(id); ui.sub = 'detail'; render(); break;
        case 'gb-rename-folder': { const input = overlayRoot.querySelector('.gbdlg input'); const folder = ICSLauncherFolders.folder(data, ui.folderId); if (folder && input) { folder.name = input.value.trim().slice(0, 40); save(); } ui.overlay = 'folder'; render(); renderOverlay(); break; }
        case 'gb-rename-cancel': ui.overlay = 'folder'; renderOverlay(); break;
        case 'gb-wallpaper': ui.overlay = 'gb-dialog-wallpaper'; renderOverlay(); break;
        case 'gb-notifications': ui.overlay = 'shade'; renderOverlay(); break;
        case 'gb-add-app': { ui.overlay = ''; const slot = data.homePages[ui.page].findIndex((item, index) => !item && widgetFits(ui.page, index % 4, Math.floor(index / 4), {type: 'x', width: 1, height: 1})); if (slot < 0) { renderOverlay(); toast('No more room on this Home screen.'); break; } data.homePages[ui.page][slot] = id; save(); render(); break; }
        case 'add-widget-gb': { ui.overlay = ''; const added = addWidget(id); if (!added) { renderOverlay(); toast('No more room on this Home screen.'); break; } if (ui.gbgPickPending) { ui.gbgPickPending = false; save(); const setup = ui.photoWidgetSetup; openApp('gallery'); ui.photoWidgetSetup = setup; ui.gbgPick = true; ui.sub = ''; render(); break; } if (ui.overlay) renderOverlay(); render(); break; }
        case 'widget-bookmark-step': { const host = button.closest('.home-widget'); if (!host) break; (ui.bookmarkWidget ||= {})[host.dataset.widgetId] = (ui.bookmarkWidget[host.dataset.widgetId] || 0) + Number(id); render(); break; }
        case 'widget-bookmark-open': openApp('browser'); navigateBrowser(id); break;
        case 'gb-preview-go': ui.overlay = ''; renderOverlay(); setHomePage(Number(id)); break;
        case 'gb-tip-next': data.protips = {...(data.protips || {set: 0}), index: ((data.protips?.index ?? -1) + 1) % GBLauncher.tips(i18n.language, data.protips?.set).length}; save(); render(); break;
        case 'gb-tip-poke': blinkTips(1); break;
        case 'browser-search': openSearch(''); break;
        default: return false;
      }
      return true;
    },
    // A folder's name field (the inherited ICS folder).
    submit(name, values, c) {
      const {ui, render} = c, event = {target: c.overlayRoot.querySelector('[data-form="folder-name"]') || c.viewport.querySelector('[data-form="folder-name"]')}, form = {dataset: {form: name}};
      if(form.dataset.form==='folder-name'){event.target.querySelector('input')?.blur();render();return true;}
      return false;
    },
    input(event, c) {
      const {data, ui, save, viewport} = c, folderName = c.folderName;
      if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',folderName(ui.folderId));button.lastElementChild.textContent=folderName(ui.folderId);}}return true;}
      return false;
    }
  };
  window.GB?.register('home', home);
  // AllApps2D: Back returns home; its pages swipe with the launcher's gestures.
  window.GB?.register('drawer', {
    render: c => shell(c).renderDrawer(),
    back(c) { c.home(false); return true; },
    action: home.action
  });
})();
