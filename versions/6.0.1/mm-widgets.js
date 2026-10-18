/* Android 6.0.1 widgets: Launcher3's widgets list (WidgetsContainerView in Velvet 5.3.27), the screen 'widgets', and the
   widgets placed on the home screen (MM.widgets, drawn by mm-launcher.js).
   - What is listed: the image's appwidget providers and CREATE_SHORTCUT activities (their manifests and
     appwidget-provider XML). Left out as in the image: GelAppFilter's SearchWidgetProvider, the providers the image
     disables (Play's Now Playing and Recommended, Settings' Power control: enabled false) and Gmail's GoogleMail twins
     (only enabled for googlemail.com accounts). WidgetsModel groups them by package with the launcher's label and icon,
     the packages sorted by label (AppNameComparator) and each package's items by label (WidgetsAndShortcutNameComparator).
   - BaseContainerView without a search bar: the panel container_bounds_inset 8 dp inside the screen
     (quantum_panel_shape_dark: #374248, 2 dp corners). widgets_list_row_view.xml: the 56 dp section (the 40 dp icon,
     16 dp after it 16 sp white text, 16 dp padding, on #374248), then a horizontal row (8 dp in, #263238) of
     widget_cell.xml cells divided by widgets_row_divider (2 dp #374248). A cell is cellWidthPx * 2.6 square (436 px):
     the name (14 sp condensed #c4c4c4, #b0000000 shadow) and widget_dims_format 5 dp after it, 8 dp padding, then the
     preview (WidgetImageView: centred when narrower than the cell, else fitted to its width).
   - The preview (WidgetPreviewLoader): previewImage at its size on the 5X (nodpi as is, others scaled to 420 dpi),
     scaled down to the 349 px preset less twice profile_badge_margin (5 dp) when wider; without one widget_tile
     spanX x spanY times with the app icon on the first tile; a shortcut: its icon greyed at alpha 15 over the whole
     preset and at the icon size top left.
   - Spans (LauncherAppWidgetProviderInfo.initSpans): the minimum size plus the default 8 dp widget padding at both
     sides, over the smallest cell of both orientations (portrait 1058 / 5 = 211.6 px wide, landscape (1017 - 2 x 16) / 5
     = 197 px high); the dims shown are capped at the 5 x 5 grid.
   - A tap shows long_press_widget_to_add; holding a cell picks the widget up onto the home screen, where it drops at
     the nearest free area of its size (out_of_space when there is none).
   - On the home screen the AppWidgetHostView keeps the default 8 dp padding. Drawn from the widgets' own layouts: the
     analog clock (analog_appwidget.xml: AnalogClock with appwidget_clock_dial / hour / minute, fitted into the view),
     the digital clock (digital_widget_time.xml: TextClock "h:mm" / "kk:mm" in widget_big_thin, 75 dp sans-serif-light,
     the date in widget_label 14 dp all caps with 0.15 letter spacing and the next alarm with ic_alarm_small in
     #b3ffffff), Sound Search (ic_soundsearch_selector centred) and Play Music's I'm Feeling Lucky (widget_ifl.xml:
     ifl_widget_background in 3 dp, the 33 dp dice). The others are still a "not built yet" card of their size. */
(() => {
  'use strict';
  const T = () => MM.text('widgets');
  const PX = 2.625;
  const dp = px => `calc(${(px / PX).toFixed(3)} * var(--dp))`;
  const CELL_W = 1058 / 5, CELL_H = (1017 - 32) / 5, PAD = 21, PRESET = 349, BADGE = 13, ICON = 168, TILE = 160;
  const span = (min, cell) => Math.max(1, Math.ceil((Math.round(min * PX) + 2 * PAD) / cell));

  // id: [app, label key, min width dp, min height dp, preview file, its width and height in px on the 5X] — a widget;
  // id: [app, label key, icon] — a shortcut.
  const WIDGETS = {
    calendar: ['calendar', 'CalendarGooglePrebuilt/gadget_title', 110, 180, 'wg-calendar.png', 336, 504],
    bookmarks: ['chrome', 'Chrome/bookmarks', 180, 110, 'wg-bookmarks.png', 640, 540],
    analog: ['clock', 'PrebuiltDeskClockGoogle/analog_gadget', 110, 110, 'wg-analog.png', 300, 300],
    digital: ['clock', 'PrebuiltDeskClockGoogle/digital_gadget', 206, 129, 'wg-digital.png', 545, 240],
    drive: ['drive', 'Drive/app_name', 294, 60, 'wg-drive.png', 1344, 336],
    gmail: ['gmail', 'PrebuiltGmail/app_name', 180, 180, 'wg-gmail.png', 638, 504],
    now: ['search', 'Velvet/widget_name', 300, 250, 'wg-now.png', 984, 552],
    soundsearch: ['search', 'Velvet/soundsearch_widget_name', 60, 60, 'wg-soundsearch.png', 189, 189],
    hangouts: ['hangouts', 'Hangouts/app_name', 180, 180, 'wg-hangouts.png', 638, 504],
    'messenger-list': ['messenger', 'PrebuiltBugle/widget_conversation_name', 250, 180, 'wg-messenger.png', 672, 564],
    'messenger-conversation': ['messenger', 'PrebuiltBugle/widget_conversation_name', 180, 180, 'wg-messenger-conv.png', 672, 500],
    music: ['play-music', 'Music2/app_name', 240, 40, 'wg-music.png', 656, 168],
    ifl: ['play-music', 'Music2/app_name', 40, 40, 'wg-ifl.png', 294, 294],
    market: ['play-store', 'Phonesky/widget_apps', 110, 110, '', 0, 0]
  };
  const SHORTCUTS = {
    'sc-bookmark': ['chrome', 'Chrome/bookmark_shortcut_name', 'assets/wg-sc-bookmark.png'],
    'sc-contact': ['contacts', 'GoogleContacts/shortcutContact', 'assets/wg-sc-contact.png'],
    'sc-dial': ['contacts', 'GoogleContacts/shortcutDialContact', 'assets/wg-sc-dial.png'],
    'sc-message': ['contacts', 'GoogleContacts/shortcutMessageContact', 'assets/wg-sc-message.png'],
    'sc-drive': ['drive', 'Drive/create_shortcut_label', 'assets/wg-sc-drive.png'],
    'sc-drivescan': ['drive', 'Drive/widget_scan_to_drive', 'assets/wg-sc-drivescan.png'],
    'sc-gmaillabel': ['gmail', 'PrebuiltGmail/activity_create_label_shortcut', 'assets/wg-sc-gmaillabel.png'],
    'sc-directions': ['maps', 'Maps/DIRECTIONS_WIDGET_NAME', ''],
    'sc-playlist': ['play-music', 'Music2/musicshortcutlabel', 'assets/wg-sc-playlist.png'],
    'sc-settings': ['settings', 'Settings/settings_shortcut', '']
  };
  const info = id => {
    const w = WIDGETS[id];
    if (w) return {id, kind: 'widget', app: w[0], label: w[1], spanX: span(w[2], CELL_W), spanY: span(w[3], CELL_H), preview: w[4], pw: w[5], ph: w[6]};
    const s = SHORTCUTS[id];
    return s ? {id, kind: 'shortcut', app: s[0], label: s[1], icon: s[2] || MM.appsData[s[0]]?.icon, spanX: 1, spanY: 1} : null;
  };
  const label = (c, it) => T().t(it.label);

  // The preview bitmap's size and drawing, in px.
  function preview(c, it) {
    if (it.kind === 'shortcut') return `<span class="mmwg-sc" style="width:${dp(PRESET)};height:${dp(PRESET)}"><img class="ghost" src="${it.icon}" alt=""><img src="${it.icon}" alt="" style="width:${dp(ICON)};height:${dp(ICON)}"></span>`;
    let w = it.preview ? it.pw : TILE * it.spanX, h = it.preview ? it.ph : TILE * it.spanY;
    const scale = w > PRESET ? (PRESET - 2 * BADGE) / w : 1;
    w = Math.trunc(w * scale); h = Math.trunc(h * scale);
    if (it.preview) return `<img src="assets/${it.preview}" alt="" style="width:${dp(w)};height:${dp(h)}">`;
    const tile = TILE * scale, icon = ICON * Math.min(Math.min(w, h) / (Math.trunc(ICON * .25) * 2 + ICON), scale);
    return `<span class="mmwg-tiles" style="width:${dp(w)};height:${dp(h)};background-size:${dp(tile)} ${dp(tile)}"><img src="${MM.appsData[it.app]?.icon}" alt="" style="left:${dp(Math.trunc((tile - icon) / 2))};top:${dp(Math.trunc((tile - icon) / 2))};width:${dp(icon)};height:${dp(icon)}"></span>`;
  }

  // WidgetsModel: packages by label, items by label (the collator; equal labels keep the manifest order).
  function model(c) {
    const coll = new Intl.Collator(c.locale());
    const groups = new Map();
    for (const id of [...Object.keys(WIDGETS), ...Object.keys(SHORTCUTS)]) {
      const it = info(id);
      if (MM.appDisabled?.(c, it.app) || !MM.appsData[it.app]) continue;
      if (!groups.has(it.app)) groups.set(it.app, []);
      groups.get(it.app).push(it);
    }
    return [...groups.entries()].map(([app, items]) => ({app, title: MM.appLabel(c, app), items: items.sort((a, b) => coll.compare(label(c, a), label(c, b)))}))
      .sort((a, b) => coll.compare(a.title, b.title));
  }

  function render(c) {
    const t = T();
    const rows = model(c).map(g => `<div class="mmwg-row"><div class="mmwg-sec"><img src="${MM.appsData[g.app].icon}" alt=""><span>${c.safe(g.title)}</span></div>
      <div class="mmwg-cells">${g.items.map(it => `<div class="mmwg-cell" data-action="mmwg-tap" data-w="${it.id}" role="button" tabindex="0"><div class="mmwg-name"><span>${c.safe(label(c, it))}</span><small>${c.safe(AndroidStrings.format(t.t('Velvet/widget_dims_format'), Math.min(it.spanX, 5), Math.min(it.spanY, 5)))}</small></div><div class="mmwg-prev">${preview(c, it)}</div></div>`).join('')}</div></div>`).join('');
    return `<div class="mmwg"><div class="mmwg-panel"><div class="mmwg-list">${rows}</div></div></div>`;
  }

  // Holding a cell (ViewConfiguration's long press timeout) picks it up onto the home screen.
  function mount(c, root) {
    const list = root.querySelector('.mmwg-list');
    if (c.ui.widgetsScroll) list.scrollTop = c.ui.widgetsScroll;
    list.addEventListener('scroll', () => { c.ui.widgetsScroll = list.scrollTop; });
    let press = null;
    root.querySelectorAll('.mmwg-cell').forEach(cell => cell.addEventListener('pointerdown', e => {
      if (e.button) return;
      press = {x: e.clientX, y: e.clientY, timer: setTimeout(() => {
        press = null; c.ui.widgetsHeld = true;
        MM.launcherDragNew(c, {type: 'widget', w: cell.dataset.w}, e.clientX, e.clientY);
      }, 500)};
    }));
    const cancel = () => { if (press) { clearTimeout(press.timer); press = null; } };
    root.addEventListener('pointermove', e => { if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) cancel(); });
    root.addEventListener('pointerup', cancel);
    root.addEventListener('pointercancel', cancel);
  }

  // ---- On the home screen ------------------------------------------------------------------------------------------
  const pad2 = n => String(n).padStart(2, '0');
  function body(c, item) {
    const it = info(item.w);
    const w = it.spanX * MM.launcherGrid.cellW - 2 * PAD, h = it.spanY * MM.launcherGrid.cellH - 2 * PAD;
    const now = new Date();
    switch (item.w) {
      case 'analog': {
        // AnalogClock.onDraw: the 630 px dial scaled down to fit, the hands turned about its centre.
        const s = Math.min(630, w, h), hr = (now.getHours() % 12 + now.getMinutes() / 60) * 30, mn = now.getMinutes() * 6;
        return `<button type="button" class="mmwg-analog" data-action="mmwg-open" data-app="clock"><span style="width:${dp(s)};height:${dp(s)}"><img src="assets/dc-appwidget_clock_dial.png" alt=""><img src="assets/dc-appwidget_clock_hour.png" alt="" style="transform:rotate(${hr}deg)"><img src="assets/dc-appwidget_clock_minute.png" alt="" style="transform:rotate(${mn}deg)"></span></button>`;
      }
      case 'digital': {
        const h24 = MM.clock24 ? MM.clock24(c) : false;
        const time = h24 ? `${pad2(now.getHours())}:${pad2(now.getMinutes())}` : `${now.getHours() % 12 || 12}:${pad2(now.getMinutes())}`;
        const date = new Intl.DateTimeFormat(c.locale(), {weekday: 'short', month: 'long', day: 'numeric'}).format(now);
        const next = MM.clockNextAlarm ? MM.clockNextAlarm(c) : '';
        return `<button type="button" class="mmwg-digital" data-action="mmwg-open" data-app="clock"><b>${time}</b><span><i>${c.safe(date)}</i>${next ? `<em><img src="assets/dc-ic_alarm_small.png" alt="">${c.safe(next)}</em>` : ''}</span></button>`;
      }
      case 'soundsearch':
        return `<button type="button" class="mmwg-sound" data-action="mmwg-sound" aria-label="${c.safe(label(c, it))}"><img src="assets/wg-soundsearch.png" alt=""></button>`;
      case 'ifl':
        return `<button type="button" class="mmwg-ifl" data-action="mmwg-open" data-app="play-music"><img src="assets/mu-ifl_widget_background.png" alt=""><i style="background-image:url('assets/mu-btn_ifl_widget_dice.png')"></i></button>`;
    }
    return `<div class="mm-missing mmwg-missing"><b>${c.safe(c.t('Not built yet'))}</b><span>${c.safe(label(c, it))}</span></div>`;
  }
  function home(c, item) { return `<div class="mmwg-host">${body(c, item)}</div>`; }

  function action(name, el, event, c) {
    if (name === 'mmwg-tap') { if (c.ui.widgetsHeld) { c.ui.widgetsHeld = false; return true; } c.toast(T().t('Velvet/long_press_widget_to_add'), false); return true; }
    if (name === 'mmwg-open') { c.open(el.dataset.app); return true; }
    if (name === 'mmwg-sound') { c.open('missing-sound-search'); return true; }
    return false;
  }

  MM.widgets = {info, preview, home, action, PAD, outOfSpace: () => T().t('Velvet/out_of_space')};
  MM.register('widgets', {
    app: false,
    render, mount, action,
    statusColor: () => 'transparent',
    back(c) { c.ui.widgetsScroll = 0; return false; },
    // The clocks on the home screen move on each minute (in place, so a drag or a scroll goes on).
    tick(c, now) {
      if (c.ui.view !== 'home' || now.getSeconds() || c.ui.home?.dragging) return;
      c.el.viewport.querySelectorAll('.mmh-widget[data-w="analog"],.mmh-widget[data-w="digital"]').forEach(el => { el.innerHTML = home(c, {w: el.dataset.w}); });
    }
  });
})();
