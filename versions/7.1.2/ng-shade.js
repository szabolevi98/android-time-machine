/* Android 7.1.2 notification shade and quick settings (SystemUI.apk, N2G48C), the overlay 'shade'.
   - status_bar_expanded.xml: NotificationPanelView over the screen above the navigation bar; ScrimController darkens
     what is behind it to 0.62 black (mScrimBehindAlpha). Tapping the empty space closes it.
   - qs_panel.xml: QSContainer (qs_background_primary: ?android:colorPrimary of systemui_theme, material_blue_grey_900
     #263238; elevation 4 dp) from the top, the full width. Its height is QuickStatusBarHeader's 104 dp
     (status_bar_header_height) with quick settings closed and the header plus QSPanel open (calculateContainerHeight:
     104 + expansion x (80 + QSPanel)); the notification stack starts under it (positionClockAndNotifications: the
     header's height, qs_peek_height 0).
   - quick_status_bar_expanded_header.xml: the clock (SplitClockView, TextAppearance.StatusBar.Expanded.Clock at
     qs_time_collapsed_size 14 sp, sans-serif-medium, white) 16 dp from the top and the start, the alarm icon after it
     while an alarm is set (ic_access_alarms_small, 6 dp before it), the date under it (DateView "EEEMMMd", 14 sp, 4 dp
     up) fading in with the expansion (QuickStatusBarHeader.mAnimator); at the end, 4 dp down and 12 dp from the edge,
     48 dp buttons: the user switch (invisible with one user), Edit (ic_mode_edit, 14 dp padding; shown open, fading in
     with the expansion), Settings (ic_settings_20dp) and the ExpandableIndicator (12 dp padding), which turns its chevron
     (ic_volume_expand_animation / ic_volume_collapse_animation) once the expansion passes 0.93.
   - QuickQSPanel 52 dp down, 12 dp from both sides, its QSPanel padding 6 dp above: the first sysui_qqs_count (6) tiles
     of quick_settings_tiles_default ("wifi,cell,battery,dnd,flashlight,rotation,bt,airplane"), each a 48 dp
     QSTileBaseView (12 dp padding above and below the 24 dp icon) with weighted spaces between. A tap is the tile's
     secondary click (Wi-Fi and Bluetooth switch; the others click).
   - QSPanel 80 dp down: qs_brightness_padding_top 6 dp, the brightness slider (quick_settings_brightness_dialog.xml: 48
     dp high, 16 dp in; ToggleSeekBar 20 dp in at each end with ic_brightness_thumb), then PagedTileLayout's page:
     TileLayout of quick_settings_num_columns 3, three rows in portrait, cells qs_tile_height 88 dp, qs_tile_margin 16 dp
     around them and qs_tile_margin_top 16 dp above; QSTileView 4 dp padding (18 dp above), the 24 dp icon and 12 dp under
     it, the label (TextAppearance.QS.TileLabel: 12 sp sans-serif-condensed, qs_tile_text #b3ffffff, two lines), the
     content centred; then qs_panel_padding_bottom 8 dp. The page indicator only shows with a second page.
   - QSContainer.setQsExpansion / QSAnimator: QSPanel slides out from under the header (translated by its height times
     expansion - 1, clipped to what has come out), its tiles kept in place; the six quick tiles move from the header to
     their places in the grid along PathInterpolatorBuilder(0, 0, 0, 1) (more than six tiles: down first, then across),
     the grid's own icons hidden meanwhile; the brightness slider fades in from half way (start delay 0.5), the grid with
     its labels from 0.86; at the end the quick panel goes and the grid's icons show.
   - A tile of the grid clicks (Wi-Fi and Bluetooth open their detail, switching on; cellular and battery their detail;
     Do not disturb switches, showing its detail when it goes on); held, it opens the tile's settings
     (getLongClickIntent). Edit opens QSCustomizer, the gear Settings.
   - The notification stack: rows from ng-notify.js under each other, notification_divider_height 0.5 dp apart; under
     them DismissView's borderless "Clear all" at the end (8 dp padding); EmptyShadeView ("No notifications", 16 sp
     #e6ffffff, 28 dp down in its 64 dp) with none.
   - Back closes the open detail, then quick settings, then the shade (PhoneStatusBar.onBackPressed). */
(() => {
  'use strict';
  const A = name => `assets/${name}`;
  const T = () => NG.text('shade');
  const sys = () => NG.system;
  // The 6P's 560 dpi: sizes become pixels the way getDimensionPixelSize rounds them; layout runs in pixels.
  const D = 3.5, px = dp => Math.round(dp * D), WPX = 1440, W = WPX / D;
  const HEADER = 104, PANEL_TOP = 80, QQS_COUNT = 6;
  const fosi = cubic(.4, 0, .2, 1);

  // A cubic-bezier easing (x1, y1, x2, y2), solved for x.
  function cubic(x1, y1, x2, y2) {
    const f = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
    return x => { let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (f(x1, x2, m) < x) lo = m; else hi = m; } return f(y1, y2, (lo + hi) / 2); };
  }
  // PathInterpolatorBuilder: the cubic from (0, 0) to (1, 1) through the two control points, x and y each as a function
  // of the distance travelled along it.
  function pathInterpolators(c1x, c1y, c2x, c2y) {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200, u = 1 - t;
      pts.push([3 * u * u * t * c1x + 3 * u * t * t * c2x + t ** 3, 3 * u * u * t * c1y + 3 * u * t * t * c2y + t ** 3]);
    }
    const dist = [0];
    for (let i = 1; i < pts.length; i++) dist.push(dist[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = dist[dist.length - 1];
    const at = (k, f) => {
      if (f <= 0) return 0; if (f >= 1) return 1;
      let i = dist.findIndex(d => d / total >= f);
      const d0 = dist[i - 1] / total, d1 = dist[i] / total;
      return pts[i - 1][k] + (pts[i][k] - pts[i - 1][k]) * (f - d0) / ((d1 - d0) || 1);
    };
    return [f => at(0, f), f => at(1, f)];
  }

  /* QSTileHost: the tiles are Secure.QS_TILES (c.data.settings.qsTiles, QSCustomizer edits it), quick_settings_tiles_default
     until then. quick_settings_tiles_stock lists every tile the editor offers; on the 6P "work" has no managed profile
     and "night" no config_nightDisplayAvailable (false in N2G48C), so their isAvailable() leaves them out. */
  const DEFAULT_TILES = ['wifi', 'cell', 'battery', 'dnd', 'flashlight', 'rotation', 'bt', 'airplane'];
  const STOCK = ['wifi', 'cell', 'battery', 'dnd', 'flashlight', 'rotation', 'bt', 'airplane', 'location', 'hotspot', 'inversion', 'saver', 'cast'];
  const specs = c => (c.data.settings.qsTiles || DEFAULT_TILES).filter(id => STOCK.includes(id));

  // A tile as its handleUpdateState reports it.
  function tileState(c, id) {
    const s = c.data.settings, t = T(), sy = sys(), live = sy.live;
    const open = name => t.fmt('accessibility_quick_settings_open_settings', null, name);
    if (id === 'wifi') {
      // WifiTile: the network's name while connected, else "Wi-Fi".
      const wifi = sy.wifiState(c);
      return {id, label: wifi === 'connected' ? s.wifiSsid : t.t('quick_settings_wifi_label'),
        icon: wifi === 'off' ? 'sui-ic_qs_wifi_disabled.svg' : wifi === 'searching' ? 'sui-ic_qs_wifi_no_network.svg' : 'sui-ic_qs_wifi_full_4.svg',
        desc: `${t.t(wifi === 'off' ? 'quick_settings_wifi_off_label' : 'quick_settings_wifi_on_label')}${wifi === 'connected' ? `,${s.wifiSsid}` : ''},${open(t.t('quick_settings_wifi_label'))}`};
    }
    if (id === 'cell') {
      // CellularTile: the network's name, "Emergency Calls Only" in airplane mode; the signal with the data type over it
      // while mobile data carries the connection.
      const mobile = sy.mobile(c), network = t.t('carrier');
      return {id, label: mobile.service ? network : t.t('quick_settings_rssi_emergency_only'),
        icon: s.airplane ? 'sui-ic_qs_signal_disabled.svg' : 'sui-ic_qs_signal_full_4.svg', overlay: mobile.data ? 'sui-ic_qs_signal_lte.svg' : '',
        desc: `${t.fmt('accessibility_quick_settings_mobile', null, t.t(s.mobileData ? 'accessibility_cell_data_on' : 'accessibility_cell_data_off'), mobile.service ? '' : t.t('accessibility_no_signal'), mobile.service ? network : t.t('quick_settings_rssi_emergency_only'))},${open(t.t('accessibility_cell_data'))}`};
    }
    if (id === 'battery') {
      // BatteryTile: BatteryMeterDrawable at the tile's size (qs_battery_padding 2 dp), the level as a percentage.
      const b = NG.battery(), level = new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(b.level / 100);
      return {id, label: level, battery: true,
        desc: `${t.fmt('accessibility_quick_settings_battery', null, level)},${b.plugged ? t.t('expanded_header_battery_charging') : ''},${t.t('accessibility_battery_details')}`};
    }
    if (id === 'dnd') {
      // DndTile: priority only, total silence or alarms only; off it shows the animation back from its last mode.
      const zen = s.zen, st = c.ui.shade || {};
      return {id, label: t.t(['quick_settings_dnd_label', 'quick_settings_dnd_priority_label', 'quick_settings_dnd_none_label', 'quick_settings_dnd_alarms_label'][zen]),
        icon: zen === 2 ? 'sui-ic_qs_dnd_on_total_silence.svg' : zen ? 'sui-ic_qs_dnd_on.svg' : st.lastZen === 2 ? 'sui-ic_dnd_total_silence_disable_animation.svg' : 'sui-ic_dnd_disable_animation.svg',
        desc: t.t(['accessibility_quick_settings_dnd', 'accessibility_quick_settings_dnd_priority_on', 'accessibility_quick_settings_dnd_none_on', 'accessibility_quick_settings_dnd_alarms_on'][zen])};
    }
    if (id === 'flashlight') return {id, label: t.t('quick_settings_flashlight_label'),
      icon: live.flashlight ? 'sui-ic_signal_flashlight_enable_animation.svg' : 'sui-ic_signal_flashlight_disable_animation.svg', desc: t.t('quick_settings_flashlight_label')};
    if (id === 'rotation') {
      // RotationLockTile: "Auto-rotate" while the screen turns, "Portrait" while locked to it.
      const label = t.t(s.rotationLocked ? 'quick_settings_rotation_locked_portrait_label' : 'quick_settings_rotation_unlocked_label');
      return {id, label, icon: s.rotationLocked ? 'sui-ic_portrait_from_auto_rotate_animation.svg' : 'sui-ic_portrait_to_auto_rotate_animation.svg',
        desc: t.fmt('accessibility_quick_settings_rotation_value', null, label)};
    }
    if (id === 'bt') {
      // BluetoothTile: connected shows the last device's name, connecting its own icon.
      const bt = s.bluetooth ? sy.btDevices(c).filter(d => d.bonded) : [], btOn = bt.find(d => d.connected), btIng = bt.some(d => d.connecting);
      return {id, label: btOn ? btOn.name : t.t('quick_settings_bluetooth_label'),
        icon: !s.bluetooth ? 'sui-ic_qs_bluetooth_off.svg' : btOn ? 'sui-ic_qs_bluetooth_connected.svg' : btIng ? 'sui-ic_qs_bluetooth_connecting.svg' : 'sui-ic_qs_bluetooth_on.svg',
        desc: btOn ? t.fmt('accessibility_bluetooth_name', null, btOn.name) : `${t.t('accessibility_quick_settings_bluetooth')}${s.bluetooth ? `,${t.t('accessibility_not_connected')}` : ''}`};
    }
    if (id === 'airplane') return {id, label: t.t('airplane_mode'), icon: s.airplane ? 'sui-ic_signal_airplane_enable_animation.svg' : 'sui-ic_signal_airplane_disable_animation.svg', desc: t.t('airplane_mode')};
    // LocationTile: mEnable / mDisable, the AnimationIcons of ic_signal_location_*.
    if (id === 'location') return {id, label: t.t('quick_settings_location_label'),
      icon: s.location ? 'sui-ic_signal_location_enable_animation.svg' : 'sui-ic_signal_location_disable_animation.svg',
      desc: t.t(s.location ? 'accessibility_quick_settings_location_on' : 'accessibility_quick_settings_location_off')};
    // HotspotTile: in airplane mode ic_hotspot_unavailable and the label in qs_tile_tint_unavailable (#40ffffff).
    if (id === 'hotspot') return {id, label: t.t('quick_settings_hotspot_label'), dim: !!s.airplane,
      icon: s.airplane ? 'sui-ic_hotspot_unavailable.svg' : s.hotspot ? 'sui-ic_hotspot_enable_animation.svg' : 'sui-ic_hotspot_disable_animation.svg', desc: t.t('quick_settings_hotspot_label')};
    if (id === 'inversion') return {id, label: t.t('quick_settings_inversion_label'),
      icon: s.inversion ? 'sui-ic_invert_colors_enable_animation.svg' : 'sui-ic_invert_colors_disable_animation.svg', desc: t.t('quick_settings_inversion_label')};
    // DataSaverTile: ic_data_saver / ic_data_saver_off.
    if (id === 'saver') return {id, label: t.t('data_saver'), icon: s.dataSaver ? 'sui-ic_data_saver.svg' : 'sui-ic_data_saver_off.svg', desc: t.t('data_saver')};
    // CastTile: no cast devices around the simulator, so "Cast" with ic_qs_cast_off.
    if (id === 'cast') return {id, label: t.t('quick_settings_cast_title'), icon: 'sui-ic_qs_cast_off.svg', desc: `${t.t('quick_settings_cast_title')},${t.t('accessibility_quick_settings_open_details')}`};
    return null;
  }
  const tiles = c => specs(c).map(id => tileState(c, id)).filter(Boolean);
  NG.qsTiles = {DEFAULT: DEFAULT_TILES, STOCK, specs, state: tileState};

  /* PagedTileLayout: TilePages of quick_settings_num_columns 3 and three rows in portrait (TilePage.getRows), filled in
     order (distributeTiles); TileLayout.onMeasure / onLayout of a page and QuickQSPanel's HeaderTileLayout, in pixels,
     returned in dp: each tile's page, box and its icon's top left corner on the screen. The pager is as high as its
     highest page, plus the 48 dp page_decor with the PageIndicator when there is more than one page. */
  function geometry(count) {
    const cellW = Math.trunc((WPX - px(16) * 4) / 3), cellH = px(88), m = px(16);
    // QSTileView: 18 dp padding above, 4 dp below, the icon view (24 + 12 dp) and the two-line label (RobotoCondensed's
    // font padding included: 107 px at 12 sp) centred between them.
    const label = 107, inner = cellH - px(18) - px(4), iconTop = px(18) + Math.trunc((inner - (px(24) + px(12) + label)) / 2);
    const gridTop = px(PANEL_TOP) + px(6) + px(48);
    const grid = [];
    for (let i = 0; i < count; i++) {
      const page = Math.floor(i / 9), j = i % 9, col = j % 3, row = Math.floor(j / 3), x = (cellW + m) * col + m, y = gridTop + (cellH + m) * row + px(16);
      grid.push({page, x: x / D, y: y / D, w: cellW / D, h: cellH / D, iconX: (x + (cellW - px(24)) / 2) / D, iconY: (y + iconTop) / D, rowTop: (y - gridTop) / D});
    }
    // HeaderTileLayout: 48 dp tiles, the spaces between them sharing what is left by weight (LinearLayout's integer
    // shares), 12 dp in from each side; QuickQSPanel's 6 dp padding above the 12 dp tile padding.
    const n = Math.min(count, QQS_COUNT), tile = px(48), quick = [];
    let left = WPX - 2 * px(12) - n * tile, weights = n - 1, x = px(12);
    for (let i = 0; i < n; i++) {
      quick.push({x: x / D, iconX: (x + (tile - px(24)) / 2) / D, iconY: (px(52) + px(6) + px(12)) / D});
      if (i < n - 1) { const share = Math.trunc(left / weights); left -= share; weights--; x += tile + share; }
    }
    const pages = Math.max(1, Math.ceil(count / 9)), rows = Math.ceil(Math.min(count, 9) / 3);
    const tilesH = (cellH + m) * rows + (px(16) - m), decor = pages > 1 ? px(48) : 0;
    const panel = px(6) + px(48) + tilesH + decor + px(8);
    return {grid, quick, pages, decorTop: tilesH / D, panel: panel / D, full: (px(PANEL_TOP) + panel) / D};
  }

  /* A tile whose icon is one of SystemUI's AnimatedVectorDrawables (ng-qs-icons.js, docs/tools/mm-avd.py) draws it as SVG
     with SMIL: the tile just clicked plays it from where it is, the others rest on its last frame (playIcons). */
  let avdSerial = 0;
  function avd(name, cls) {
    const icon = NG.qsIcons?.[name];
    if (!icon) return '';
    const serial = ++avdSerial;
    return icon.svg.replace(/(id="|url\(#)([^")]+)/g, `$1$2-${serial}`).replace('<svg class="ng-avd"', `<svg class="ng-avd ${cls}" data-avd="${name}"`);
  }
  function tileIcon(tile) {
    if (tile.battery) return `<span class="ngqs-icon ngqs-batt">${NG.batteryMeter()}</span>`;
    if (tile.overlay !== undefined) return `<span class="ngqs-icon ngqs-signal"><img src="${A(tile.icon)}" alt="">${tile.overlay ? `<img src="${A(tile.overlay)}" alt="">` : ''}</span>`;
    const name = tile.icon.replace(/^sui-|\.svg$/g, '');
    return avd(name, 'ngqs-icon') || `<img class="ngqs-icon" src="${A(tile.icon)}" alt="">`;
  }
  // The editor (ng-qsedit.js) draws the same icons, resting on their last frame (QSIconView.disableAnimation).
  NG.qsAvd = (name, cls) => avd(name, cls);
  NG.qsRestIcons = root => playIcons(root, null);
  function playIcons(root, started) {
    for (const svg of root.querySelectorAll('svg[data-avd]')) {
      const total = (NG.qsIcons?.[svg.dataset.avd]?.duration || 0) / 1000, tile = svg.closest('[data-tile]')?.dataset.tile || svg.dataset.play;
      const elapsed = started?.[tile] !== undefined ? (performance.now() - started[tile]) / 1000 : Infinity;
      const rest = svg.dataset.rest === 'start' ? 0 : total + 1;
      try { if (elapsed < total) { svg.setCurrentTime(elapsed); svg.unpauseAnimations(); } else { svg.pauseAnimations(); svg.setCurrentTime(rest); } } catch {}
    }
  }

  // The brightness slider: the automatic adjustment (0..2048 for -1..1) or the level.
  const sliderValue = s => s.brightnessAuto ? (s.brightnessAdj + 1) / 2 : s.brightness / 255;
  const sliderMarkup = (c, value) => `<div class="ngqs-slider" role="slider" aria-label="${c.safe(T().t('accessibility_brightness'))}" aria-valuenow="${Math.round(value * 100)}" style="--v:${value.toFixed(4)}"><i class="ngqs-track"></i><i class="ngqs-progress"></i><img class="ngqs-thumb" src="${A('sui-ic_brightness_thumb.svg')}" alt=""></div>`;
  // The slider follows the pointer (the SeekBar 20 dp in at each end); the setting is saved when it is let go.
  function bindSlider(c, slider) {
    slider?.addEventListener('pointerdown', event => {
      event.preventDefault(); event.stopPropagation();
      try { slider.setPointerCapture(event.pointerId); } catch {}
      const s = c.data.settings;
      const move = e => {
        const r = slider.getBoundingClientRect(), pad = 20 * c.el.screen.clientWidth / W;
        const v = Math.min(1, Math.max(0, (e.clientX - r.left - pad) / (r.width - 2 * pad)));
        if (s.brightnessAuto) s.brightnessAdj = Math.round(v * 2048) / 1024 - 1; else s.brightness = Math.round(v * 255);
        slider.style.setProperty('--v', v.toFixed(4)); slider.setAttribute('aria-valuenow', Math.round(v * 100));
        sys().applyBrightness(c);
      };
      move(event);
      const up = () => { slider.removeEventListener('pointermove', move); c.save(); };
      slider.addEventListener('pointermove', move);
      slider.addEventListener('pointerup', up, {once: true}); slider.addEventListener('pointercancel', up, {once: true});
    });
  }

  // SplitClockView: the time, and in 12-hour locales the AM / PM part after it.
  function headerClock(c) {
    const now = new Date(), locale = c.locale();
    const h24 = c.data.settings.time24 ?? !new Intl.DateTimeFormat(locale, {hour: 'numeric'}).resolvedOptions().hour12;
    const mm = String(now.getMinutes()).padStart(2, '0');
    if (h24) return `${now.getHours()}:${mm}`;
    const ampm = new Intl.DateTimeFormat(locale, {hour: 'numeric', hour12: true}).formatToParts(now).find(p => p.type === 'dayPeriod')?.value || '';
    return `${now.getHours() % 12 || 12}:${mm} ${c.safe(ampm)}`;
  }
  // DateView with abbrev_wday_month_day_no_year_alarm "EEEMMMd", the locale's best pattern for it.
  const headerDate = c => new Intl.DateTimeFormat(c.locale(), {weekday: 'short', month: 'short', day: 'numeric'}).format(new Date());

  function tileHtml(c, tile, box) {
    const pos = `left:calc(${box.x.toFixed(3)} * var(--dp));top:calc(${box.rowTop.toFixed(3)} * var(--dp));width:calc(${box.w.toFixed(3)} * var(--dp));height:calc(${box.h.toFixed(3)} * var(--dp))`;
    return `<button type="button" class="ngqs-tile" style="${pos}" data-action="ngqs-click" data-tile="${tile.id}" aria-label="${c.safe(tile.desc)}">${tileIcon(tile)}<span class="ngqs-label${tile.dim ? ' dim' : ''}">${c.safe(tile.label)}</span></button>`;
  }
  // PageIndicator: a major_a_b dot per page (16 x 8 dp), each (16 - 0.4 x 16) dp after the one before; the current page's
  // at full alpha, the others at 0.3; centred in the 48 dp page_decor under the tiles.
  function dots(c, n, at, top) {
    const step = 16 - 16 * .4;
    return `<div class="ngqs-decor" style="top:calc(${top.toFixed(3)} * var(--dp))" role="img" aria-label="${c.safe(T().fmt('accessibility_quick_settings_page', null, at + 1, n))}"><span class="ngqs-dots" style="width:calc(${((n - 1) * step + 16).toFixed(2)} * var(--dp))">${Array.from({length: n}, (_, i) => `<img src="${A('sui-major_a_b.svg')}" alt="" style="left:calc(${(i * step).toFixed(2)} * var(--dp));opacity:${i === at ? 1 : .3}">`).join('')}</span></div>`;
  }
  function quickHtml(c, tile, box) {
    return `<button type="button" class="ngqs-quick" style="left:calc(${box.x.toFixed(3)} * var(--dp))" data-action="ngqs-quick" data-tile="${tile.id}" aria-label="${c.safe(tile.desc)}">${tileIcon(tile)}</button>`;
  }

  function render(c) {
    const st = c.ui.shade || (c.ui.shade = {qs: false, detail: ''});
    const t = T(), list = tiles(c), geo = geometry(list.length), page = Math.min(st.page || 0, geo.pages - 1);
    const notes = c.notifications?.() || [];
    const alarm = (c.data.clock?.alarms || []).some(x => x.on);
    const detail = st.detail ? `<div class="ngqs-detail">${NG.qsDetail?.has(st.detail) ? NG.qsDetail.render(c, st.detail, st.origin) : c.missing(`qs-${st.detail}`)}</div>` : '';
    const stack = notes.length
      ? notes.map(n => NG.notifications.row(c, n)).join('') + `<div class="ngsh-dismiss"><button type="button" data-action="ngsh-clearall" aria-label="${c.safe(t.t('accessibility_clear_all'))}">${c.safe(t.t('clear_all_notifications_text'))}</button></div>`
      : `<div class="ngsh-empty">${c.safe(t.t('empty_shade_text'))}</div>`;
    return `<div class="ngsh${st.qs ? ' qs' : ''}${st.detail ? ' detail' : ''}${st.opened ? ' shown' : ''}" style="--qsf:${st.qs ? 1 : 0};--qs-full:${geo.full.toFixed(3)};--qs-panel:${geo.panel.toFixed(3)}">
      <div class="ngsh-scrim" data-action="ngsh-close"></div>
      <div class="ngsh-panel">
        <div class="ngsh-stack" data-action="ngsh-close">${stack}</div>
        <div class="ngqs" aria-label="${c.safe(t.t('accessibility_desc_quick_settings'))}">
          <div class="ngqs-panel">
            <div class="ngqs-brightness">${sliderMarkup(c, sliderValue(c.data.settings))}</div>
            <div class="ngqs-grid"><div class="ngqs-pages" style="--page:${page}">${Array.from({length: geo.pages}, (_, p) => `<div class="ngqs-page" style="left:${p * 100}%">${list.map((tile, i) => geo.grid[i].page === p ? tileHtml(c, tile, geo.grid[i]) : '').join('')}</div>`).join('')}</div>${geo.pages > 1 ? dots(c, geo.pages, page, geo.decorTop) : ''}</div>
          </div>
          <div class="ngqs-header">
            <div class="ngqs-datetime"><div class="ngqs-clock"><span class="ngqs-time">${headerClock(c)}</span>${alarm ? `<img class="ngqs-alarm" src="${A('sui-ic_access_alarms_small.svg')}" alt="">` : ''}</div><div class="ngqs-date">${c.safe(headerDate(c))}</div></div>
            <div class="ngqs-buttons">
              <span class="ngqs-user"></span>
              <button type="button" class="ngqs-edit" data-action="ngqs-edit" aria-label="${c.safe(t.t('accessibility_quick_settings_edit'))}"><img src="${A('sui-ic_mode_edit.svg')}" alt=""></button>
              <button type="button" class="ngqs-gear" data-action="ngqs-settings" aria-label="${c.safe(t.t('accessibility_quick_settings_settings'))}"><img src="${A('sui-ic_settings_20dp.svg')}" alt=""></button>
              <button type="button" class="ngqs-expand" data-action="ngqs-expand" aria-label="${c.safe(t.t(st.qs ? 'accessibility_quick_settings_collapse' : 'accessibility_quick_settings_expand'))}">${avd(st.qs ? 'ic_volume_expand_animation' : 'ic_volume_collapse_animation', 'ngqs-chevron').replace('<svg', '<svg data-play="expand"')}</button>
            </div>
            <div class="ngqs-quickrow">${list.slice(0, QQS_COUNT).map((tile, i) => quickHtml(c, tile, geo.quick[i])).join('')}</div>
          </div>
          ${detail}
        </div>
        ${st.edit && NG.qsEdit ? NG.qsEdit.render(c) : ''}
      </div>
      ${st.dialog ? NG.dialog.markup(c, st.dialog) : ''}
    </div>`;
  }

  // Lays the shade out for a quick settings expansion e (0 closed .. 1 open): QSContainer.setQsExpansion and QSAnimator.
  const [pathX, pathY] = pathInterpolators(0, 0, 0, 1);
  const clamp01 = v => Math.min(1, Math.max(0, v));
  function apply(c, root, e) {
    const el = root.querySelector('.ngsh'); if (!el) return;
    const geo = geometry(tiles(c).length), dp = c.el.screen.clientWidth / W;
    el.style.setProperty('--qsf', e.toFixed(4));
    el.classList.toggle('qs-moving', e > 0 && e < 1);
    el.classList.toggle('qs-open', e >= 1);
    // On the first page the quick tiles fly to their grid places, the grid's own icons waiting for them; on another page
    // QSAnimator's mNonfirstPageAnimator fades the quick panel out over the first half instead.
    const first = !(c.ui.shade?.page > 0), row = root.querySelector('.ngqs-quickrow');
    if (row) row.style.opacity = first ? '' : (1 - clamp01(e / .5)).toFixed(4);
    root.querySelectorAll('.ngqs-quick').forEach((q, i) => {
      const from = geo.quick[i], to = geo.grid[i]; if (!to || !first) { q.style.transform = ''; return; }
      const tx = (to.iconX - from.iconX) * pathX(e), ty = (to.iconY - from.iconY) * pathY(e);
      q.style.transform = `translate(${(tx * dp).toFixed(2)}px,${(ty * dp).toFixed(2)}px)`;
    });
    el.style.setProperty('--qs-bright', clamp01((e - .5) / .5).toFixed(4));
    el.style.setProperty('--qs-grid', clamp01((e - .86) / .14).toFixed(4));
    // The chevron turns once the expansion passes 0.93.
    const up = e > .93, chev = root.querySelector('.ngqs-expand');
    if (chev && chev.dataset.up !== String(up)) {
      const was = chev.dataset.up; chev.dataset.up = String(up);
      if (was !== undefined) {
        chev.innerHTML = avd(up ? 'ic_volume_expand_animation' : 'ic_volume_collapse_animation', 'ngqs-chevron').replace('<svg', '<svg data-play="expand"');
        playIcons(chev, {expand: performance.now()});
        chev.setAttribute('aria-label', T().t(up ? 'accessibility_quick_settings_collapse' : 'accessibility_quick_settings_expand'));
      }
    }
  }
  // Animates the expansion to its end (NotificationPanelView.flingSettings: 360 ms, fast out slow in).
  let anim = 0;
  function settle(c, to, done) {
    const root = c.el.overlay, el = root.querySelector('.ngsh'); if (!el) return;
    const from = parseFloat(el.style.getPropertyValue('--qsf')) || 0, start = performance.now(), id = ++anim;
    const step = now => {
      if (id !== anim) return;
      const f = Math.min(1, (now - start) / 360), e = from + (to - from) * fosi(f);
      apply(c, root, e);
      if (f < 1) requestAnimationFrame(step); else done?.();
    };
    requestAnimationFrame(step);
  }

  function mount(c, root) {
    const st = c.ui.shade, shade = root.querySelector('.ngsh');
    const chev = root.querySelector('.ngqs-expand'); if (chev) chev.dataset.up = String(!!st.qs);
    // The detail's circular reveal plays once.
    if (st.detail) st.revealed = true;
    apply(c, root, st.qs ? 1 : 0);
    // Opening: the panel is laid out pulled up, then slides down (a forced layout makes the transition start).
    if (!st.opened && shade) { void shade.offsetHeight; st.opened = true; shade.classList.add('shown'); }
    bindSlider(c, root.querySelector('.ngqs-slider'));
    playIcons(root, st.started);
    // A tile held for the long press timeout (500 ms) opens its settings (QSTile.handleLongClick).
    for (const tile of root.querySelectorAll('.ngqs-tile')) {
      tile.addEventListener('pointerdown', () => {
        const timer = setTimeout(() => { tile.dataset.long = '1'; longClick(c, tile.dataset.tile); }, 500);
        const stop = () => { clearTimeout(timer); tile.removeEventListener('pointerup', stop); tile.removeEventListener('pointerleave', stop); };
        tile.addEventListener('pointerup', stop); tile.addEventListener('pointerleave', stop);
      });
    }
    bindPages(c, root);
    if (st.edit) NG.qsEdit?.mount(c, root.querySelector('.ngqe'), ctl);
    if (st.dialog) NG.dialog.mountLong(c, root, st.dialog);
    // Dragging on the open shade moves the same expansion as pulling the status bar (see drag).
    shade?.addEventListener('pointerdown', ev => { if (ev.button || ev.target.closest('.ngqs-slider,.ngqs-detail,.ngqe,.ngdlg')) return; drag(c, ev, false); });
  }

  /* The pager (PagedTileLayout is a ViewPager): a horizontal drag over the tiles moves the pages under the finger; let go,
     it settles on the page it was dragged to past half its width or flung to (ViewPager's MIN_FLING_VELOCITY 400 dp/s
     over MIN_DISTANCE_FOR_FLING 25 dp), with ViewPager's quintic ease out. */
  function bindPages(c, root) {
    const pager = root.querySelector('.ngqs-pages'), st = c.ui.shade, n = root.querySelectorAll('.ngqs-page').length;
    if (!pager || n < 2) return;
    pager.addEventListener('pointerdown', e => {
      if (e.button || !st.qs) return;
      const dpPx = c.el.screen.clientWidth / W, x0 = e.clientX, y0 = e.clientY, t0 = performance.now(), w = pager.clientWidth;
      let paging = false, dx = 0, last = [x0, t0], speed = 0;
      const move = ev => {
        dx = ev.clientX - x0;
        if (!paging) {
          if (Math.abs(dx) / dpPx <= 9 || Math.abs(dx) < Math.abs(ev.clientY - y0)) return;
          paging = true; pager.classList.add('dragging');
        }
        const now = performance.now(); speed = (ev.clientX - last[0]) / Math.max(1, now - last[1]) * 1000 / dpPx; last = [ev.clientX, now];
        const at = st.page || 0, off = Math.max(-(n - 1 - at) * w, Math.min(at * w, dx));
        pager.style.transform = `translateX(${(-at * w + off).toFixed(1)}px)`;
        ev.stopPropagation();
      };
      const up = () => {
        document.removeEventListener('pointermove', move, true);
        document.removeEventListener('pointerup', up, true);
        document.removeEventListener('pointercancel', up, true);
        if (!paging) return;
        st.dragged = true; setTimeout(() => { st.dragged = false; }, 0);
        const at = st.page || 0, fling = Math.abs(speed) > 400 && Math.abs(dx) / dpPx > 25;
        const to = Math.max(0, Math.min(n - 1, fling ? at - Math.sign(dx) : Math.abs(dx) > w / 2 ? at - Math.sign(dx) : at));
        st.page = to; pager.classList.remove('dragging'); pager.style.transform = '';
        pager.style.setProperty('--page', to);
        const decor = root.querySelector('.ngqs-decor');
        if (decor) { decor.setAttribute('aria-label', T().fmt('accessibility_quick_settings_page', null, to + 1, n)); decor.querySelectorAll('img').forEach((img, i) => { img.style.opacity = i === to ? 1 : .3; }); }
      };
      document.addEventListener('pointermove', move, true);
      document.addEventListener('pointerup', up, true);
      document.addEventListener('pointercancel', up, true);
    });
  }

  function setQs(c, on) {
    const st = c.ui.shade; st.qs = on; if (!on) st.detail = '';
    c.el.overlay.querySelector('.ngsh')?.classList.toggle('qs', on);
    settle(c, on ? 1 : 0, () => { if (!on) { st.page = 0; refresh(c); } });
  }
  function open(c, qs = false) {
    c.ui.shade = {qs, detail: '', opened: false};
    c.overlay('shade');
  }
  function close(c) {
    anim++;
    const el = c.el.overlay.querySelector('.ngsh');
    if (!el) { c.closeOverlay(); return; }
    el.classList.remove('shown'); el.classList.add('closing');
    setTimeout(() => { if (c.ui.overlay === 'shade') c.closeOverlay(); }, 250);
  }
  function refresh(c) {
    // A detail closing redraws once its animation is over.
    if (c.ui.overlay !== 'shade' || c.ui.shade?.closing) return;
    anim++;
    c.el.overlay.innerHTML = render(c);
    mount(c, c.el.overlay);
    c.el.overlay.querySelector('.ngsh')?.classList.add('shown', 'static');
  }

  // A grid tile's click (QSTile.handleClick).
  function click(c, id) {
    const s = c.data.settings, st = c.ui.shade, sy = sys();
    (st.started ||= {})[id] = performance.now();
    if (id === 'wifi') { if (!s.wifi) sy.setWifi(c, true); showDetail(c, 'wifi'); }
    else if (id === 'bt') { if (!s.bluetooth) sy.setBluetooth(c, true); showDetail(c, 'bt'); }
    else if (id === 'cell') showDetail(c, 'cell');
    else if (id === 'battery') showDetail(c, 'battery');
    else if (id === 'dnd') { if (s.zen) { st.lastZen = s.zen; sy.setZen(c, 0); } else { st.lastZen = 0; showDetail(c, 'dnd'); sy.setZen(c, s.zenFavorite || 3); } }
    else if (id === 'flashlight') sy.setFlashlight(c, !sy.live.flashlight);
    else if (id === 'rotation') sy.setRotationLocked(c, !s.rotationLocked);
    else if (id === 'airplane') sy.setAirplane(c, !s.airplane);
    else if (id === 'location') sy.setLocation(c, !s.location);
    // HotspotTile.handleClick: nothing in airplane mode unless it is on.
    else if (id === 'hotspot') { if (s.hotspot || !s.airplane) sy.setHotspot(c, !s.hotspot); }
    else if (id === 'inversion') sy.setInversion(c, !s.inversion);
    // DataSaverTile.handleClick: the first time it goes on, the SystemUIDialog asks first (Prefs QsDataSaverDialogShown).
    else if (id === 'saver') {
      if (!s.dataSaver && !s.qsDataSaverDialogShown) {
        const t = T();
        st.dialog = {title: t.t('data_saver_enable_title'), message: t.t('data_saver_description'),
          buttons: [{label: t.t('cancel')}, {label: t.t('data_saver_enable_button'), action: c => sy.setDataSaver(c, true)}]};
        s.qsDataSaverDialogShown = true; c.save(); refresh(c);
      } else sy.setDataSaver(c, !s.dataSaver);
    }
    else if (id === 'cast') showDetail(c, 'cast');
  }
  // A quick tile's click is QSTile.secondaryClick: Wi-Fi and Bluetooth switch (handleSecondaryClick), the rest click.
  function quickClick(c, id) {
    const s = c.data.settings, st = c.ui.shade, sy = sys();
    (st.started ||= {})[id] = performance.now();
    if (id === 'wifi') sy.setWifi(c, !s.wifi);
    else if (id === 'bt') sy.setBluetooth(c, !s.bluetooth);
    else click(c, id);
  }
  // getLongClickIntent: the tile's settings screen (the flashlight's is the camera).
  function longClick(c, id) {
    const to = {wifi: ['settings', 'wifi'], cell: ['settings', 'data-usage'], battery: ['settings', 'battery'], dnd: ['settings', 'zen'],
      flashlight: ['camera', ''], rotation: ['settings', 'display'], bt: ['settings', 'bluetooth'], airplane: ['settings', 'wireless'],
      location: ['settings', 'location'], hotspot: ['settings', 'wireless'], inversion: ['settings', 'accessibility'], saver: ['settings', 'data-saver'], cast: ['settings', 'cast']}[id];
    if (id === 'flashlight') { click(c, id); return; }   // FlashlightTile.handleLongClick is its click
    if (!to) return;
    c.closeOverlay(); c.open(to[0], to[1]);
  }
  // QSDetail over quick settings (QSPanel.showDetail): the panel opens fully under it.
  // The reveal starts at the tile's centre in QSContainer (QSPanel.showDetail: the tile view's centre plus the grid's top).
  function showDetail(c, id) {
    const st = c.ui.shade, list = tiles(c), geo = geometry(list.length), i = list.findIndex(x => x.id === id), box = geo.grid[i];
    st.detail = id; st.qs = true; st.revealed = false;
    st.origin = box ? {x: box.x + box.w / 2, y: box.y + box.h / 2} : null;
    refresh(c);
  }
  /* Closing runs the reveal backwards from the farthest corner to the tile (450 ms), the background turning back to
     #66ffffff after 0.65 of it over 0.35 (QSDetailClipper.mReverseBackground). */
  function closeDetail(c) {
    const st = c.ui.shade, el = c.el.overlay.querySelector('.ngqd');
    const finish = () => { st.detail = ''; st.revealed = false; st.closing = false; refresh(c); };
    if (!el || !el.animate || st.closing) { finish(); return; }
    st.closing = true;
    const cs = getComputedStyle(el), at = `at ${cs.getPropertyValue('--rx').trim() || '50%'} ${cs.getPropertyValue('--ry').trim() || '0px'}`;
    el.classList.remove('reveal');
    el.animate([{clipPath: `circle(150% ${at})`}, {clipPath: `circle(0px ${at})`}], {duration: 450, easing: 'cubic-bezier(.37,0,.63,1)', fill: 'forwards'});
    el.animate([{background: '#263238'}, {background: '#ffffff66'}], {duration: 158, delay: 292, fill: 'forwards'});
    setTimeout(finish, 450);
  }
  const ctl = {refresh, close, closeDetail};

  /* Dragging the shade (PanelView / NotificationPanelView): one expansion under the finger, from closed through the
     notifications (the panel follows the pointer from the top, the scrim darkens with it) on to quick settings fully
     out, and back the same way. It starts on the status bar (closed) or anywhere on the open shade. Let go, it settles
     on the nearest stop the way it last moved (PanelView.flingExpands): closed, the notifications, or quick settings. */
  function drag(c, e, closed) {
    const dpPx = c.el.screen.clientWidth / W;
    let el = null, P = 1, Q = 1, e0 = 0, pos = 0, moved = false, last = e.clientY, dir = 0;
    const setup = () => {
      el = c.el.overlay.querySelector('.ngsh'); if (!el) return false;
      P = el.clientHeight * .6 / dpPx; Q = (parseFloat(el.style.getPropertyValue('--qs-full')) || 454) - HEADER;
      e0 = closed ? 0 : P + (c.ui.shade?.qs ? Q : 0); pos = e0; return true;
    };
    if (!closed && !setup()) return;
    const parts = () => [el.querySelector('.ngsh-panel'), el.querySelector('.ngsh-scrim')];
    const move = ev => {
      const dy = (ev.clientY - e.clientY) / dpPx;
      if (!moved) {
        if (Math.abs(dy) <= 9 || Math.abs(ev.clientX - e.clientX) / dpPx > Math.abs(dy) || (closed && dy < 0)) return;
        moved = true; anim++;
        if (closed) { open(c); if (!setup()) return; }
      }
      if (!el) return;
      if (ev.clientY !== last) dir = Math.sign(ev.clientY - last);
      last = ev.clientY;
      pos = Math.max(0, Math.min(P + Q, e0 + dy));
      const pf = Math.min(1, pos / P), qf = clamp01((pos - P) / Q), [panel, scrim] = parts();
      el.classList.add('dragging', 'shown'); c.el.screen.classList.add('bar-drag');
      panel.style.transform = `translateY(${((pf - 1) * 100).toFixed(2)}%)`;
      scrim.style.opacity = (.62 * pf).toFixed(3);
      apply(c, c.el.overlay, qf);
      ev.preventDefault();
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      c.el.screen.classList.remove('bar-drag');
      if (!moved || !el) return;
      c.ui.shadePulled = Date.now();
      // The click that follows the release must not count as a tap on what is under the pointer.
      if (c.ui.shade) { c.ui.shade.dragged = true; setTimeout(() => { if (c.ui.shade) c.ui.shade.dragged = false; }, 0); }
      const pf = pos / P, qf = (pos - P) / Q;
      const stop = pos <= P ? (dir > 0 ? pf > .15 : dir < 0 ? pf >= .85 : pf >= .5) ? 1 : 0
        : (dir > 0 ? qf > .15 : dir < 0 ? qf >= .85 : qf >= .5) ? 2 : 1;
      const [panel, scrim] = parts();
      el.classList.remove('dragging'); panel.style.transform = ''; scrim.style.opacity = '';
      if (stop === 0) { close(c); return; }
      const st = c.ui.shade; if (stop === 2 && st.detail) st.detail = '';
      st.qs = stop === 2; el.classList.toggle('qs', st.qs);
      settle(c, st.qs ? 1 : 0);
    };
    document.addEventListener('pointermove', move, {passive: false});
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  }
  function bindPull(c) {
    c.el.status.addEventListener('pointerdown', e => {
      if (e.button || c.ui.overlay || c.ui.view === 'lock' || c.ui.sleeping || c.ui.power) return;
      drag(c, e, true);
    });
  }

  /* Clear all (NotificationStackScrollLayout.clearAllNotifications): the rows fly off to the right from the bottom one
     up, 10 ms apart in 260 ms, then the panel collapses. */
  function clearAll(c) {
    const rows = [...c.el.overlay.querySelectorAll('.ngsh-stack .ngnt-row')].reverse();
    rows.forEach((r, i) => r.animate?.([{translate: '0 0'}, {translate: `${r.offsetWidth}px 0`}], {duration: 260, delay: i * 10, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards'}));
    setTimeout(() => {
      c.data.notifications = (c.data.notifications || []).filter(n => n.ongoing); c.save(); c.renderStatus?.();
      close(c);
    }, 260 + rows.length * 10 + 50);
  }

  NG.register('shade', {
    app: false,
    init: bindPull,
    render, mount, open, close, refresh,
    back(c) {
      const st = c.ui.shade;
      if (!st) return false;
      if (st.dialog) { st.dialog = null; refresh(c); return true; }
      if (st.edit) { NG.qsEdit?.hide(c, null, ctl); return true; }
      if (st.detail) { closeDetail(c); return true; }
      if (st.qs) { setQs(c, false); return true; }
      close(c); return true;
    },
    action(name, el, event, c) {
      const st = c.ui.shade;
      if (st?.dragged) { st.dragged = false; return true; }
      if (name === 'ngsh-close') { close(c); return true; }
      if (name === 'ngnt-open') { close(c); NG.notifications.open(c, el.dataset.id); return true; }
      if (name === 'ngsh-clearall') { clearAll(c); return true; }
      if (name === 'ngqs-expand') { setQs(c, !st.qs); return true; }
      if (name === 'ngqs-settings') { c.closeOverlay(); c.open('settings'); return true; }
      if (/^ngdlg-/.test(name) && st?.dialog) return NG.dialog.action(c, name, el, st.dialog, () => { st.dialog = null; refresh(c); });
      if (/^ngqe-/.test(name)) return !!NG.qsEdit?.action(c, name, el, ctl);
      // QSPanel.showEdit: the editor opens out of the Edit button's centre.
      if (name === 'ngqs-edit') { if (NG.qsEdit) { const b = el.getBoundingClientRect(), q = c.el.overlay.querySelector('.ngqs').getBoundingClientRect(), dp = c.el.screen.clientWidth / W; NG.qsEdit.show(c, {x: (b.left + b.width / 2 - q.left) / dp, y: (b.top + b.height / 2 - q.top) / dp}, ctl); } return true; }
      if (name === 'ngqs-click') { if (el.dataset.long) { delete el.dataset.long; return true; } click(c, el.dataset.tile); return true; }
      if (name === 'ngqs-quick') { quickClick(c, el.dataset.tile); return true; }
      if (name === 'ng-close' && st?.detail) { closeDetail(c); return true; }
      if (/^ng(qd|zp)-/.test(name)) return !!NG.qsDetail?.action(c, name, el, ctl);
      return false;
    },
    tick(c, now) {
      if (c.ui.overlay !== 'shade' || now.getSeconds()) return;
      const time = c.el.overlay.querySelector('.ngqs-time'), date = c.el.overlay.querySelector('.ngqs-date');
      if (time) time.innerHTML = headerClock(c);
      if (date) date.textContent = headerDate(c);
      for (const el of c.el.overlay.querySelectorAll('.ngnt-time')) el.textContent = NG.notifications.relative(c, +el.dataset.time);
    }
  });
})();
