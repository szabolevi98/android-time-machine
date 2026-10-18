/* Android 6.0.1 notification shade and quick settings (SystemUI.apk, MTC20K), the overlay 'shade'.
   - status_bar_expanded.xml: NotificationPanelView over the whole screen above the navigation bar; ScrimController darkens
     what is behind it to 0.62 black. Tapping the empty space closes it (PanelView: a click in the middle collapses).
   - status_bar_expanded_header.xml (StatusBarHeaderView), elevation 4 dp, notification_header_bg (system_secondary_color
     #384248): 60 dp collapsed, 116 dp with quick settings open. Collapsed: the clock at 14 sp over the date (eeeeMMMMd,
     14 sp #b2ffffff) 10 dp from the bottom, 24 dp from the left; at the right the header's own system icons (the signal
     cluster and the battery; the status icons stay in the status bar) and the user's avatar (ic_account_circle in
     user_icon_1, 22 dp in a 34 dp switch 13 dp from the end). Expanded: the clock at 20 sp, the date 20 dp from the
     bottom, the signal cluster detached to the left of the battery, the battery level (NumberFormat percent, 12 sp), the
     settings button (48 dp, turning in from 90 degrees) and the avatar at 24 dp in a 48 dp switch 8 dp from the end.
     Clicking the header opens or closes quick settings (NotificationPanelView.onClick); the battery opens the battery
     usage page, the gear Settings.
   - qs_panel.xml: QSContainer (qs_background_primary: system_primary_color #263238, 2 dp corners, its top 2 dp under the
     header) 8 dp from the sides, 116 dp from the top, 8 dp padding above and below, elevation 2 dp. QSPanel: the
     brightness slider 6 dp down, then the tiles of quick_settings_tiles_default (wifi, bt, inversion, dnd, cell, airplane,
     rotation, flashlight, location, cast, hotspot) that are visible, as QSPanel.onMeasure lays them out: a new row when a
     row is full (quick_settings_num_columns 3) or when the dual-target kind changes, so Wi-Fi and Bluetooth fill the first
     row as dual tiles (qs_dual_tile_height 112 dp, 1.2 x as wide) and the rest go three by three (qs_tile_height 88 dp, 1.2 x
     as wide), each row's tiles spread with equal gaps; the rows after the first start qs_dual_tile_padding_vertical (8 dp)
     higher. QSTileView: the 24 dp icon 18 dp down (qs_tile_spacing 4 + qs_tile_padding_top 14), the label 12 dp below it
     (12 sp sans-serif-condensed #b3ffffff, two lines); a dual tile has the 1 dp divider (#29ffffff) there and a
     clickable label with qs_dual_tile_caret (8 dp padding above and below) that opens the tile's detail.
   - quick_settings_brightness_dialog.xml: ToggleSlider without its toggle (gone) and without the icon (gone): a SeekBar
     with 16 + 20 dp at each end, ic_brightness_thumb (28 dp), the 2 dp Material track (colorControlNormal at 0.3, the
     progress in colorAccent system_accent_color #80cbc4). BrightnessController: automatic brightness (on in the image)
     moves screen_auto_brightness_adj from -1 to 1 (the slider 0 to 2048), manual brightness the level.
   - The notification stack: EmptyShadeView ("No notifications", 20 sp white, 12 dp from the top of its 64 dp) when there
     is none (notifications come with the apps that post them).
   - Back closes the open detail, then quick settings, then the shade (PhoneStatusBar.onBackPressed). */
(() => {
  'use strict';
  const A = name => `assets/${name}`;
  const T = () => MM.text('shade');
  const sys = () => MM.system;
  const DENSITY = 2.625;   // xxhdpi-ish 420 dpi: dimensions round to pixels as getDimensionPixelSize does
  const px = dp => Math.round(dp * DENSITY);
  const W = 411.4286;      // the screen in dp

  // The tiles of quick_settings_tiles_default, as their handleUpdateState reports them.
  function tiles(c) {
    const s = c.data.settings, t = T(), st = c.ui.shade || {}, sy = sys();
    const wifi = sy.wifiState(c), mobile = sy.mobile(c);
    const out = [];
    out.push({id: 'wifi', dual: true, label: wifi === 'connected' ? s.wifiSsid : t.t('quick_settings_wifi_label'),
      icon: wifi === 'off' ? 'sui-ic_qs_wifi_disabled.svg' : wifi === 'searching' ? 'sui-ic_qs_wifi_no_network.svg' : 'sui-ic_qs_wifi_full_4.svg',
      desc: t.fmt('accessibility_quick_settings_wifi', null, wifi === 'off' ? t.t('accessibility_wifi_off') : wifi === 'searching' ? t.t('accessibility_no_wifi') : t.fmt('accessibility_wifi_name', null, s.wifiSsid))});
    // BluetoothTile.handleUpdateState: connected shows the last device's name, connecting its own icon.
    const bt = s.bluetooth ? sy.btDevices(c).filter(d => d.bonded) : [], btOn = bt.find(d => d.connected), btIng = bt.some(d => d.connecting);
    out.push({id: 'bt', dual: true, label: btOn ? btOn.name : t.t('quick_settings_bluetooth_label'),
      icon: !s.bluetooth ? 'sui-ic_qs_bluetooth_off.svg' : btOn ? 'sui-ic_qs_bluetooth_connected.svg' : btIng ? 'sui-ic_qs_bluetooth_connecting.svg' : 'sui-ic_qs_bluetooth_on.svg',
      desc: !s.bluetooth ? t.t('accessibility_quick_settings_bluetooth_off') : btOn ? `${t.t('accessibility_quick_settings_bluetooth_connected')} ${t.fmt('accessibility_bluetooth_name', null, btOn.name)}`
        : t.t(btIng ? 'accessibility_quick_settings_bluetooth_connecting' : 'accessibility_quick_settings_bluetooth_on')});
    // inversion: visible only while on or recently used (UsageTracker); the simulator has no colour inversion yet.
    const zen = s.zen;
    out.push({id: 'dnd', label: t.t(['quick_settings_dnd_label', 'quick_settings_dnd_priority_label', 'quick_settings_dnd_none_label', 'quick_settings_dnd_alarms_label'][zen]),
      icon: zen === 2 ? 'sui-ic_qs_dnd_on_total_silence.svg' : zen ? 'sui-ic_qs_dnd_on.svg' : st.lastZen === 2 ? 'sui-ic_dnd_total_silence_disable_animation.svg' : 'sui-ic_dnd_disable_animation.svg',
      desc: t.t(['accessibility_quick_settings_dnd_off', 'accessibility_quick_settings_dnd_priority_on', 'accessibility_quick_settings_dnd_none_on', 'accessibility_quick_settings_dnd_alarms_on'][zen])});
    // CellularTile: the network's name (no service in airplane mode, its trailing period removed), the signal, the data
    // type over it while mobile data carries the connection.
    const network = mobile.service ? t.t('carrier') : t.t('framework/lockscreen_carrier_default').replace(/\.$/, '');
    out.push({id: 'cell', label: network, icon: s.airplane ? 'sui-ic_qs_signal_disabled.svg' : 'sui-ic_qs_signal_full_4.svg', overlay: mobile.data ? 'sui-ic_qs_signal_lte.svg' : '',
      desc: t.fmt('accessibility_quick_settings_mobile', null, t.t(mobile.service ? 'carrier' : 'accessibility_no_signal').replace(/\.$/, ''), t.t('accessibility_no_data').replace(/\.$/, ''), network)});
    out.push({id: 'airplane', label: t.t('airplane_mode'), icon: s.airplane ? 'sui-ic_signal_airplane_enable_animation.svg' : 'sui-ic_signal_airplane_disable_animation.svg',
      desc: t.t(s.airplane ? 'accessibility_quick_settings_airplane_on' : 'accessibility_quick_settings_airplane_off')});
    out.push({id: 'rotation', label: t.t(s.rotationLocked ? 'quick_settings_rotation_locked_portrait_label' : 'quick_settings_rotation_unlocked_label'),
      icon: s.rotationLocked ? 'sui-ic_portrait_from_auto_rotate_animation.svg' : 'sui-ic_portrait_to_auto_rotate_animation.svg',
      desc: t.t(s.rotationLocked ? 'accessibility_rotation_lock_on_portrait' : 'accessibility_rotation_lock_off')});
    const torch = sy.live.flashlight;
    out.push({id: 'flashlight', label: t.t('quick_settings_flashlight_label'), icon: torch ? 'sui-ic_signal_flashlight_enable_animation.svg' : 'sui-ic_signal_flashlight_disable_animation.svg',
      desc: t.t(torch ? 'accessibility_quick_settings_flashlight_on' : 'accessibility_quick_settings_flashlight_off')});
    out.push({id: 'location', label: t.t('quick_settings_location_label'), icon: s.location ? 'sui-ic_signal_location_enable_animation.svg' : 'sui-ic_signal_location_disable_animation.svg',
      desc: t.t(s.location ? 'accessibility_quick_settings_location_on' : 'accessibility_quick_settings_location_off')});
    out.push({id: 'cast', label: t.t('quick_settings_cast_title'), icon: 'sui-ic_qs_cast_off.svg', desc: t.t('quick_settings_cast_title')});
    // hotspot: visible only when supported and recently used (UsageTracker); not yet.
    return out;
  }

  // QSPanel.onMeasure / onLayout in pixels at the image's density, returned in dp.
  function layout(list) {
    const cellH = px(88), cellW = Math.trunc(cellH * 1.2), largeH = px(112), largeW = Math.trunc(largeH * 1.2);
    const width = Math.round(W * DENSITY) - 2 * px(8), brightness = px(6) + px(16) * 2 + px(28);
    let row = -1, col = -1, dual = false;
    for (const tile of list) {
      if (row === -1 || col === 2 || dual !== !!tile.dual) { row++; col = 0; dual = !!tile.dual; } else col++;
      tile.row = row; tile.col = col;
    }
    const rows = row + 1;
    const top = r => r > 0 ? brightness + largeH - px(8) + (r - 1) * cellH : brightness;
    for (const tile of list) {
      const n = list.filter(x => x.row === tile.row).length, w = tile.row ? cellW : largeW;
      const x = tile.col * w + (tile.col + 1) * Math.trunc((width - w * n) / (n + 1));
      Object.assign(tile, {x: x / DENSITY, y: top(tile.row) / DENSITY, w: w / DENSITY, h: (tile.row ? cellH : largeH) / DENSITY});
    }
    return {height: (top(rows) + px(8)) / DENSITY};
  }

  function tileHtml(c, tile) {
    const t = c.safe;
    const icon = tile.id === 'cell'
      ? `<span class="mmqs-signal"><img src="${A(tile.icon)}" alt="">${tile.overlay ? `<img class="mmqs-overlay" src="${A(tile.overlay)}" alt="">` : ''}</span>`
      : `<img class="mmqs-icon" src="${A(tile.icon)}" alt="">`;
    const pos = `left:calc(${tile.x.toFixed(3)} * var(--dp));top:calc(${tile.y.toFixed(3)} * var(--dp));width:calc(${tile.w.toFixed(3)} * var(--dp));height:calc(${tile.h.toFixed(3)} * var(--dp))`;
    if (tile.dual) {
      return `<div class="mmqs-tile dual" style="${pos}" data-tile="${tile.id}"><button type="button" class="mmqs-top" data-action="mmqs-click" data-tile="${tile.id}" aria-label="${t(tile.desc)}">${icon}</button>`
        + `<i class="mmqs-divider"></i><button type="button" class="mmqs-dual" data-action="mmqs-secondary" data-tile="${tile.id}"><span class="mmqs-line"><span>${t(tile.label)}</span><img src="${A('sui-qs_dual_tile_caret.svg')}" alt=""></span></button></div>`;
    }
    return `<button type="button" class="mmqs-tile" style="${pos}" data-action="mmqs-click" data-tile="${tile.id}" aria-label="${t(tile.desc)}">${icon}<span class="mmqs-label">${t(tile.label)}</span></button>`;
  }

  // The brightness slider: the automatic adjustment (0..2048 for -1..1) or the level above the minimum.
  function sliderValue(s) { return s.brightnessAuto ? (s.brightnessAdj + 1) / 2 : s.brightness / 255; }
  const sliderMarkup = (c, value) => `<div class="mmqs-slider" role="slider" aria-label="${c.safe(T().t('accessibility_brightness'))}" aria-valuenow="${Math.round(value * 100)}" style="--v:${value.toFixed(4)}"><i class="mmqs-track"></i><i class="mmqs-progress"></i><img class="mmqs-thumb" src="${A('sui-ic_brightness_thumb.svg')}" alt=""></div>`;
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

  // StatusBarHeaderView's clock: SplitClockView, the time and in 12-hour locales the AM / PM part at 14 sp.
  function headerClock(c) {
    const now = new Date(), locale = c.locale();
    const h24 = c.data.settings.time24 ?? !new Intl.DateTimeFormat(locale, {hour: 'numeric'}).resolvedOptions().hour12;
    const mm = String(now.getMinutes()).padStart(2, '0');
    if (h24) return `<span class="mmsh-time">${now.getHours()}:${mm}</span>`;
    const ampm = new Intl.DateTimeFormat(locale, {hour: 'numeric', hour12: true}).formatToParts(now).find(p => p.type === 'dayPeriod')?.value || '';
    return `<span class="mmsh-time">${now.getHours() % 12 || 12}:${mm}</span><span class="mmsh-ampm"> ${c.safe(ampm)}</span>`;
  }
  const headerDate = c => new Intl.DateTimeFormat(c.locale(), {weekday: 'long', month: 'long', day: 'numeric'}).format(new Date());

  // A posted notification (notification_template_material_base: the 40 dp icon circle, the title in
  // TextAppearance.Material.Notification.Title, the text, the actions of notification_material_action_list).
  function noteHtml(c, n, i) {
    return `<div class="mmsh-note" data-action="mmsh-noop"><div class="mmsh-nmain"><span class="mmsh-nicon"><img src="${n.icon}" alt=""></span><span class="mmsh-ntexts"><b>${c.safe(n.title)}</b><small>${c.safe(n.text)}</small></span></div>
      ${n.actions?.length ? `<div class="mmsh-nactions">${n.actions.map((a, j) => `<button type="button" data-action="mmsh-naction" data-i="${i}" data-j="${j}">${c.safe(a.label)}</button>`).join('')}</div>` : ''}</div>`;
  }
  function render(c) {
    const st = c.ui.shade || (c.ui.shade = {qs: false, detail: ''});
    const t = T(), list = tiles(c).filter(x => x.visible !== false), geo = layout(list), b = MM.battery();
    const level = new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(b.level / 100);
    const notes = c.notifications?.() || [];
    const qsH = 8 + geo.height + 8;
    const value = sliderValue(c.data.settings);
    const detail = st.detail ? `<div class="mmqs-detail">${MM.qsDetail?.has(st.detail) ? MM.qsDetail.render(c, st.detail, st.origin) : c.missing(`qs-${st.detail}`)}</div>` : '';
    const dhead = st.detail && MM.qsDetail?.has(st.detail) ? MM.qsDetail.header(c, st.detail) : '';
    const scan = st.detail && st.scanUntil > Date.now() ? '<i class="mmsh-scan"></i>' : '';
    return `<div class="mmsh${st.qs ? ' qs' : ''}${st.detail ? ' detail' : ''}${st.opened ? ' shown' : ''}" style="--qs-h:${qsH.toFixed(3)}">
      <div class="mmsh-scrim" data-action="mmsh-close"></div>
      <div class="mmsh-panel">
        <div class="mmsh-stack" data-action="mmsh-close">${notes.length ? notes.map((n, i) => noteHtml(c, n, i)).join('') : `<div class="mmsh-empty">${c.safe(t.t('empty_shade_text'))}</div>`}</div>
        <div class="mmsh-qs"><div class="mmqs-panel" style="height:calc(${geo.height.toFixed(3)} * var(--dp))">
          <div class="mmqs-brightness">${sliderMarkup(c, value)}</div>
          ${list.map(tile => tileHtml(c, tile)).join('')}${detail}</div></div>
        <div class="mmsh-header" data-action="mmsh-header">
          ${dhead}${scan}<div class="mmsh-clockdate"><div class="mmsh-clock">${headerClock(c)}</div><div class="mmsh-date">${c.safe(headerDate(c))}</div></div>
          <div class="mmsh-right">
            <span class="mmsh-cluster">${MM.signalCluster ? MM.signalCluster(c) : ''}</span>
            <button type="button" class="mmsh-sys" data-action="mmsh-battery" aria-label="${c.safe(t.fmt('accessibility_battery_level', null, b.level))}"><span class="mmsh-batt"></span><span class="mmsh-level">${c.safe(level)}</span></button>
            <button type="button" class="mmsh-gear" data-action="mmsh-settings" aria-label="${c.safe(t.t('accessibility_desc_settings'))}"><img src="${A('sui-ic_settings.svg')}" alt=""></button>
            <button type="button" class="mmsh-user" data-action="mmsh-user" aria-label="${c.safe(t.t('accessibility_multi_user_switch_quick_contact'))}"><img src="${A('fw-ic_account_circle-user0.svg')}" alt=""></button>
          </div>
        </div>
      </div>
    </div>`;
  }

  // The header's battery is the status bar's BatteryMeterView drawing.
  function mount(c, root) {
    const slot = root.querySelector('.mmsh-batt'); if (slot && MM.batteryMeter) slot.innerHTML = MM.batteryMeter();
    const st = c.ui.shade;
    // Opening: the panel is laid out pulled up, then slides down (a forced layout makes the transition start).
    const shade = root.querySelector('.mmsh');
    if (!st.opened && shade) { void shade.offsetHeight; st.opened = true; shade.classList.add('shown'); }
    // The detail's circular reveal plays once; the scan line goes when the access points are in.
    if (st.detail) st.revealed = true;
    if (st.scanUntil > Date.now()) { clearTimeout(st.scanTimer); st.scanTimer = setTimeout(() => root.querySelector('.mmsh-scan')?.remove(), st.scanUntil - Date.now()); }
    // The slider follows the pointer; the setting is saved when it is let go.
    bindSlider(c, root.querySelector('.mmqs-slider'));
    // Dragging the panel: down opens quick settings, up closes them, then the shade.
    const panel = root.querySelector('.mmsh-panel');
    let start = null;
    panel?.addEventListener('pointerdown', e => { st.dragged = false; if (!e.target.closest('.mmqs-slider')) start = {y: e.clientY}; });
    panel?.addEventListener('pointerup', e => {
      if (!start) return;
      const dy = (e.clientY - start.y) / (c.el.screen.clientWidth / W); start = null;
      if (dy > 40 && !st.qs) { st.dragged = true; setQs(c, true); }
      else if (dy < -40) { st.dragged = true; if (st.qs) setQs(c, false); else close(c); }
    });
  }

  function setQs(c, on) {
    const st = c.ui.shade; st.qs = on; if (!on) st.detail = '';
    c.el.overlay.querySelector('.mmsh')?.classList.toggle('qs', on);
    if (!on) refresh(c);
  }
  function open(c, qs = false) {
    c.ui.shade = {qs, detail: '', opened: false};
    c.overlay('shade');
  }
  function close(c) {
    const el = c.el.overlay.querySelector('.mmsh');
    if (!el) { c.closeOverlay(); return; }
    el.classList.remove('shown'); el.classList.add('closing');
    setTimeout(() => { if (c.ui.overlay === 'shade') c.closeOverlay(); }, 250);
  }
  function refresh(c) {
    if (c.ui.overlay !== 'shade') return;
    const old = c.el.overlay.querySelector('.mmsh');
    c.el.overlay.innerHTML = render(c);
    mount(c, c.el.overlay);
    if (old) c.el.overlay.querySelector('.mmsh')?.classList.add('shown', 'static');
  }

  function click(c, id) {
    const s = c.data.settings, st = c.ui.shade, sy = sys();
    if (id === 'wifi') sy.setWifi(c, !s.wifi);
    else if (id === 'bt') sy.setBluetooth(c, !s.bluetooth);
    else if (id === 'dnd') { if (s.zen) { st.lastZen = s.zen; sy.setZen(c, 0); } else { st.lastZen = 0; sy.setZen(c, s.zenFavorite || 3); showDetail(c, 'dnd'); } }
    else if (id === 'cell') showDetail(c, 'cell');
    else if (id === 'airplane') sy.setAirplane(c, !s.airplane);
    else if (id === 'rotation') { s.rotationLocked = !s.rotationLocked; c.save(); refresh(c); }
    else if (id === 'flashlight') { sy.live.flashlight = !sy.live.flashlight; refresh(c); }
    else if (id === 'location') { s.location = !s.location; c.save(); refresh(c); }
    else if (id === 'cast') showDetail(c, 'cast');
  }
  // A dual tile's label: switch the radio on and show its detail (WifiTile / BluetoothTile.handleSecondaryClick).
  function secondary(c, id) {
    const s = c.data.settings, sy = sys();
    if (id === 'wifi' && !s.wifi) sy.setWifi(c, true);
    if (id === 'bt' && !s.bluetooth) sy.setBluetooth(c, true);
    showDetail(c, id);
  }
  function showDetail(c, id) {
    const st = c.ui.shade, tile = tiles(c), geo = layout(tile), hit = tile.find(x => x.id === id);
    st.detail = id; st.revealed = false;
    st.origin = hit ? {x: hit.x + hit.w / 2, y: hit.y + hit.h / 2 + 10} : null;
    st.scanUntil = MM.qsDetail?.scanning(id) ? Date.now() + 1200 : 0;
    void geo; refresh(c);
  }
  function closeDetail(c) { const st = c.ui.shade; st.detail = ''; st.revealed = false; refresh(c); }
  const ctl = {refresh, close, closeDetail};

  /* Pulling the status bar down (PhoneStatusBar's touch on the status bar → NotificationPanelView.startExpandMotion):
     the panel follows the pointer from the top and the scrim darkens with it; let go past a third of the way it opens,
     else it closes; pulled on past 220 dp, quick settings open as well (the second pull of PanelView). */
  function bindPull(c) {
    c.el.status.addEventListener('pointerdown', e => {
      if (e.button || c.ui.overlay || c.ui.view === 'lock' || c.ui.sleeping || c.ui.power) return;
      const dpPx = () => c.el.screen.clientWidth / W, top = () => c.el.screen.getBoundingClientRect().top;
      let pulled = false, frac = 0, dy = 0;
      const parts = () => { const el = c.el.overlay.querySelector('.mmsh'); return el ? {el, panel: el.querySelector('.mmsh-panel'), scrim: el.querySelector('.mmsh-scrim')} : null; };
      const move = ev => {
        dy = (ev.clientY - e.clientY) / dpPx();
        if (!pulled) { if (dy <= 9 || Math.abs(ev.clientX - e.clientX) / dpPx() > dy) return; pulled = true; open(c); }
        const p = parts(); if (!p) return;
        frac = Math.max(0, Math.min(1, (ev.clientY - top()) / (p.el.clientHeight * .6)));
        p.el.classList.add('dragging', 'shown');
        p.panel.style.transform = `translateY(${((frac - 1) * 100).toFixed(2)}%)`;
        p.scrim.style.opacity = (.62 * frac).toFixed(3);
        ev.preventDefault();
      };
      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointercancel', up);
        if (!pulled) return;
        c.ui.shadePulled = Date.now();
        const p = parts(); if (!p) return;
        p.el.classList.remove('dragging'); p.panel.style.transform = ''; p.scrim.style.opacity = '';
        if (frac < 1 / 3) close(c);
        else if (dy > 220) setQs(c, true);
      };
      document.addEventListener('pointermove', move, {passive: false});
      document.addEventListener('pointerup', up, {once: true});
      document.addEventListener('pointercancel', up, {once: true});
    });
  }

  MM.register('shade', {
    app: false,
    init: bindPull,
    render, mount, open, close, refresh,
    back(c) {
      const st = c.ui.shade;
      if (!st) return false;
      if (st.detail) { closeDetail(c); return true; }
      if (st.qs) { setQs(c, false); return true; }
      close(c); return true;
    },
    action(name, el, event, c) {
      const st = c.ui.shade;
      if (st?.dragged) { st.dragged = false; return true; }
      if (name === 'mmsh-close') { close(c); return true; }
      if (name === 'mmsh-noop') return true;
      if (name === 'mmsh-naction') { const n = c.notifications()[+el.dataset.i]; close(c); n?.actions?.[+el.dataset.j]?.action(c); return true; }
      if (name === 'mmsh-header') { setQs(c, !st.qs); return true; }
      if (name === 'mmsh-settings') { if (!st.qs) { setQs(c, true); return true; } c.closeOverlay(); c.open('settings'); return true; }
      if (name === 'mmsh-battery') { if (!st.qs) { setQs(c, true); return true; } c.closeOverlay(); c.open('settings', 'battery'); return true; }
      if (name === 'mmsh-user') { if (!st.qs) { setQs(c, true); return true; } showDetail(c, 'user'); return true; }
      if (name === 'mmqs-click') { click(c, el.dataset.tile); return true; }
      if (name === 'mmqs-secondary') { secondary(c, el.dataset.tile); return true; }
      if (/^mm(qd|zp|ud)-/.test(name)) return !!MM.qsDetail?.action(c, name, el, ctl);
      return false;
    },
    tick(c, now) {
      if (c.ui.overlay !== 'shade' || now.getSeconds()) return;
      const clock = c.el.overlay.querySelector('.mmsh-clock'), date = c.el.overlay.querySelector('.mmsh-date');
      if (clock) clock.innerHTML = headerClock(c);
      if (date) date.textContent = headerDate(c);
    }
  });

  // SystemUI's BrightnessDialog (android.intent.action.SHOW_BRIGHTNESS_DIALOG, Settings' Brightness level): an activity
  // in Theme.DeviceDefault.Dialog (the dark Material dialog, background_floating_material_dark #424242 inset 16 dp, 95 %
  // of the width) at the top (Gravity.TOP), without the dim (FLAG_DIM_BEHIND cleared) and without a title, holding
  // quick_settings_brightness_dialog.xml; a touch outside or Back finishes it (the volume keys too).
  MM.register('brightness', {
    app: false,
    render: c => `<div class="mmbd"><div class="mmbd-out" data-action="mmbd-close"></div><div class="mmbd-win"><div class="mmbd-slider">${sliderMarkup(c, sliderValue(c.data.settings))}</div></div></div>`,
    mount(c, root) { bindSlider(c, root.querySelector('.mmqs-slider')); },
    action(name, el, event, c) { if (name === 'mmbd-close') { c.closeOverlay(); return true; } return false; }
  });
})();
