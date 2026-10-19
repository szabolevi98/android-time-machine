/* Android 7.1.2 quick settings details (SystemUI.apk, N2G48C), drawn by ng-shade.js over QSContainer.
   - qs_detail.xml: QSDetail fills QSContainer (qs_detail_background: a TransitionDrawable from qs_detail_transition
     #66ffffff to ?android:colorPrimary #263238, run over 0.6 of the reveal), 8 dp padding below; qs_detail_margin_top
     28 dp, then qs_detail_header.xml (the adapter's title, TextAppearance.QS.DetailHeader 20 sp sans-serif-medium, 16 dp
     in; with getToggleState not null a Switch 16 dp from the end and the whole header clickable), the content, and
     qs_detail_buttons.xml at the bottom end, 8 dp in: MORE SETTINGS (button2, min 132 dp, 8 dp before DONE; gone without
     a settings intent) and DONE (button1, min 88 dp), TextAppearance.QS.DetailButton (14 sp sans-serif-medium, all caps,
     qs_detail_button: quaternary_device_default_settings #b0bec5) on QSBorderlessButton (12 dp padding, the ripple
     inset 4 dp). QSDetailClipper opens it with a circular reveal from the tile's centre (the default 300 ms x 1.5)
     and closes it the same way back; once open the header and the grid behind it are hidden.
   - QSDetailItems (qs_detail_items.xml): qs_detail_items_padding_top 16 dp at sw410dp, 16 dp at the sides; rows of
     qs_detail_item.xml (48 dp at least: the 24 dp icon, 20 + 12 dp, the title TextAppearance.QS.DetailItemPrimary 16 sp
     white and the summary 2 dp under it, DetailItemSecondary 14 sp in colorAccent #80cbc4; for a connected Bluetooth
     device the 48 dp ic_qs_cancel); with none, the 56 dp empty icon and its text 20 dp under it (DetailEmpty 14 sp
     qs_subhead #99ffffff), centred. Rows hide while the radio is off (setItemsVisible).
   - WifiDetailAdapter: WifiTracker's access points (the active first, then saved, then by level and name) with
     AccessPointControllerImpl's ic_qs_wifi_full_0..3 by level and qs_ic_wifi_lock over a secured one, the active one's
     summary wifi_status "Connected"; a saved or open network connects, a secured new one opens Wi-Fi settings and the
     panel collapses; the detail closes either way. The toggle switches Wi-Fi and closes the detail (setToggleState).
   - BluetoothDetailAdapter: the bonded devices (ic_qs_bluetooth_on, connected / connecting with their icons and
     summaries, the disconnect button); the toggle switches Bluetooth and closes the detail.
   - CellularDetailAdapter: data_usage.xml (DataUsageDetailView: 16 dp padding; the title, the usage at 36 sp in the
     accent, formatBytes with DecimalFormat("#.##") in KB under 100 KB, MB under 100 MB, else GB; DataUsageGraph 8 dp high,
     8 dp down and 16 dp above the texts: the track #33ffffff, the usage in the accent, the 4 dp white warning marker;
     the carrier and "… warning" side by side, the cycle under them in #99ffffff); the toggle switches mobile data.
   - BatteryTile.BatteryDetail (battery_detail.xml): the level at 2.6 times textAppearanceSmall in the accent and
     BatteryInfo's "Approx. … left" (Formatter.formatShortElapsedTime) under it; settingslib's UsageView 141 dp high
     (16 dp from the start, 24 from the end, 27 dp space above and below): the 56 dp column of battery_labels in
     #66ffffff, UsageGraph's three 1 dp dividers (listDivider #1f on white), the level line (3 dp, round, 6 dp corners) in
     the accent over a gradient of it at 0.2 down to nothing, the dotted projection (0.75 dp dots 7 dp apart, three times
     as wide, tertiary_device_default_settings #455a64) to empty at the right edge; under it "… ago" and "… left". Then
     the 1 dp divider and the Battery Saver row (the BatteryMeterDrawable full with its plus, 16 sp title, the Switch);
     while charging it is dimmed to 0.7 with battery_detail_charging_summary. No header toggle (getToggleState null).
   - DndDetailAdapter: ZenModePanel (zen_mode_panel.xml): SegmentedButtons (8 dp above and below, 16 dp in;
     segmented_buttons_background #14ffffff with 2 dp corners; 72 dp high, 16 sp, the selected white sans-serif-medium,
     the others #b0bec5 sans-serif) Total silence / Alarms only / Priority only; for priority only and total silence until
     dismissed the introduction on the light accent (#009688, 2 dp corners, 8 dp padding, the 14 sp text 12 dp down and
     24 dp in with 1.2 line spacing, the 48 dp close button, CUSTOMIZE for priority only); the conditions (8 dp down, 4 dp
     in): radio buttons (40 x 48 dp, 7 dp in) for "Until you turn this off", the countdown (ZenModeConfig.MINUTE_BUCKETS
     15, 30, 45 minutes and 1 to 12 hours, an hour by default, with ic_qs_minus / ic_qs_plus, half transparent at the ends)
     and the next alarm when it is within a week; the alarm warning in system_error #f4511e. The toggle off turns Do
     not disturb off and closes the detail. */
(() => {
  'use strict';
  const A = name => `assets/${name}`;
  const T = () => NG.text('qsdetail');
  const sys = () => NG.system;
  const BUCKETS = [15, 30, 45, ...Array.from({length: 12}, (_, i) => (i + 1) * 60)];
  const DEFAULT_BUCKET = BUCKETS.indexOf(60);
  // The settings page each detail's MORE SETTINGS opens (the adapters' getSettingsIntent).
  const SETTINGS = {wifi: 'wifi', bt: 'bluetooth', cell: 'data-usage', battery: 'battery', dnd: 'zen'};

  function title(c, id) {
    const t = T();
    return {wifi: () => t.t('quick_settings_wifi_label'), bt: () => t.t('quick_settings_bluetooth_label'), cell: () => t.t('quick_settings_cellular_detail_title'),
      battery: () => t.t('battery_panel_title'), dnd: () => t.t('quick_settings_dnd_label')}[id]?.() || '';
  }
  // getToggleState: null for the battery (no switch).
  function toggleState(c, id) {
    const s = c.data.settings;
    return {wifi: s.wifi, bt: s.bluetooth, cell: s.mobileData, dnd: s.zen !== 0}[id] ?? null;
  }
  const switchHtml = on => `<span class="ngqd-switch${on ? ' on' : ''}" aria-hidden="true"><i></i></span>`;

  function items(c, list, empty, visible = true) {
    const safe = c.safe;
    if (!list.length) return `<div class="ngqd-items"><div class="ngqd-empty"><img src="${A(empty.icon)}" alt=""><span>${safe(empty.text)}</span></div></div>`;
    return `<div class="ngqd-items">${list.map((item, i) => `<div class="ngqd-item${visible ? '' : ' hidden'}" data-action="ngqd-item" data-index="${i}" role="button">
      <span class="ngqd-icon"><img src="${A(item.icon)}" alt="">${item.overlay ? `<img src="${A(item.overlay)}" alt="">` : ''}</span>
      <span class="ngqd-text"><span class="ngqd-line1${item.line2 ? '' : ' two'}">${safe(item.line1)}</span>${item.line2 ? `<span class="ngqd-line2">${safe(item.line2)}</span>` : ''}</span>${item.canDisconnect ? `<button type="button" class="ngqd-close" data-action="ngqd-disconnect" data-index="${i}" aria-label="${safe(T().t('media_route_controller_disconnect'))}"><img src="${A('sui-ic_qs_cancel.svg')}" alt=""></button>` : ''}</div>`).join('')}</div>`;
  }

  function wifiItems(c) {
    const status = T().t('wifi_status');
    return sys().accessPoints(c).map(ap => ({ap, icon: `sui-ic_qs_wifi_full_${Math.max(0, ap.level)}.svg`, overlay: ap.secure ? 'sui-qs_ic_wifi_lock.svg' : '',
      line1: ap.ssid, line2: ap.active ? (Array.isArray(status) ? status[5] : 'Connected') : ''}));
  }
  function btItems(c) {
    const t = T();
    return sys().btDevices(c).filter(d => d.bonded).map(d => d.connected ? {d, icon: 'sui-ic_qs_bluetooth_connected.svg', line1: d.name, line2: t.t('quick_settings_connected'), canDisconnect: true}
      : d.connecting ? {d, icon: 'sui-ic_qs_bluetooth_connecting.svg', line1: d.name, line2: t.t('quick_settings_connecting')} : {d, icon: 'sui-ic_qs_bluetooth_on.svg', line1: d.name});
  }

  // DataUsageDetailView.formatBytes: DecimalFormat("#.##") in the locale's digits.
  function formatBytes(c, bytes) {
    const v = Math.abs(bytes), [n, unit] = v > 104857600 ? [v / 1073741824, 'GB'] : v > 102400 ? [v / 1048576, 'MB'] : [v / 1024, 'KB'];
    return `${new Intl.NumberFormat(c.locale(), {maximumFractionDigits: 2, useGrouping: false}).format(Math.sign(bytes || 1) * n)} ${unit}`;
  }
  function dataUsage(c) {
    const t = T(), u = sys().dataUsage(c);
    let head, amount, top = null, bottom = null, color = '#80cbc4';
    if (u.usage >= u.warning && u.limit > 0) {
      head = t.t(u.usage > u.limit ? 'quick_settings_cellular_detail_over_limit' : 'quick_settings_cellular_detail_remaining_data');
      amount = Math.abs(u.usage - u.limit); if (u.usage > u.limit) color = '#f4511e';
      top = t.fmt('quick_settings_cellular_detail_data_used', null, formatBytes(c, u.usage)); bottom = t.fmt('quick_settings_cellular_detail_data_limit', null, formatBytes(c, u.limit));
    } else {
      head = t.t('quick_settings_cellular_detail_data_usage'); amount = u.usage;
      top = t.fmt('quick_settings_cellular_detail_data_warning', null, formatBytes(c, u.warning));
    }
    const max = Math.max(u.limit, u.warning, u.usage, 1), graph = u.warning > 0 || u.limit > 0;
    return `<div class="ngqd-data"><div class="ngqd-dtitle">${c.safe(head)}</div><div class="ngqd-usage" style="color:${color}">${c.safe(formatBytes(c, amount))}</div>
      ${graph ? `<div class="ngqd-graph"><i style="width:${(u.usage / max * 100).toFixed(2)}%"></i><b style="left:calc(${(u.warning / max * 100).toFixed(2)}% - 2 * var(--dp))"></b></div>` : ''}
      <div class="ngqd-drow"><span>${c.safe(u.carrier)}</span><span>${graph && top ? c.safe(top) : ''}</span></div>
      <div class="ngqd-drow ngqd-dsec"><span>${c.safe(u.period)}</span><span>${bottom ? c.safe(bottom) : ''}</span></div></div>`;
  }

  // Formatter.formatShortElapsedTime: days, days and hours, hours, hours and minutes, minutes … rounded as it rounds.
  function shortElapsed(c, ms) {
    const t = T(); let s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
    if (d >= 2) return t.fmt('framework/durationDays', null, d + Math.floor((h + 12) / 24));
    if (d > 0) return t.fmt(h === 1 ? 'framework/durationDayHour' : 'framework/durationDayHours', null, d, h);
    if (h >= 2) return t.fmt('framework/durationHours', null, h + Math.floor((m + 30) / 60));
    if (h > 0) return t.fmt(m === 1 ? 'framework/durationHourMinute' : 'framework/durationHourMinutes', null, h, m);
    if (m >= 2) return t.fmt('framework/durationMinutes', null, m + Math.floor((s + 30) / 60));
    if (m > 0) return t.fmt(s === 1 ? 'framework/durationMinuteSecond' : 'framework/durationMinuteSeconds', null, m, s);
    return t.fmt(s === 1 ? 'framework/durationSecond' : 'framework/durationSeconds', null, s);
  }
  /* The simulator's battery (ng-statusbar.js): unplugged at 100 % 52 minutes before the page loaded, a percent every four
     minutes since; BatteryStats' estimate of the time left goes on at that rate. The history is that line, the projection
     the dotted rest to empty at the right edge (UsageGraph.drawProjection). */
  function battery(c) {
    const t = T(), b = NG.battery(), s = c.data.settings, now = Date.now();
    const since = now - (100 - b.level) * 240000, left = b.plugged ? 0 : b.level * 240000;
    const pct = new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(b.level / 100);
    const W = 300, H = 100, total = (now - since) + left, x = (now - since) / total * W, y = (1 - b.level / 100) * H;
    const labels = t.t('battery_labels');
    const svg = `<svg class="ngqd-usagegraph" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="ngqd-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#80cbc4" stop-opacity=".2"/><stop offset="1" stop-color="#80cbc4" stop-opacity="0"/></linearGradient></defs>
      ${left ? `<path d="M${x.toFixed(2)} ${y.toFixed(2)}L${W} ${H}" class="ngqd-proj"/>` : ''}<path d="M0 0L${x.toFixed(2)} ${y.toFixed(2)}L${x.toFixed(2)} ${H}L0 ${H}Z" fill="url(#ngqd-grad)"/><path d="M0 0L${x.toFixed(2)} ${y.toFixed(2)}" class="ngqd-line"/></svg>`;
    const charging = b.plugged;
    return `<div class="ngqd-battery"><div class="ngqd-charge"><span class="ngqd-pct">${c.safe(pct)}</span>${left ? `<br>${c.safe(t.fmt('power_remaining_duration_only', null, shortElapsed(c, left)))}` : ''}</div>
      <div class="ngqd-usageview"><div class="ngqd-graphrow"><div class="ngqd-side"><span>${c.safe(labels[2])}</span><span>${c.safe(labels[1])}</span><span>${c.safe(labels[0])}</span></div>
        <div class="ngqd-plot"><i></i><i></i><i></i>${svg}</div></div>
        <div class="ngqd-bottom"><span>${c.safe(t.fmt('charge_length_format', null, shortElapsed(c, now - since)))}</span><span>${left ? c.safe(t.fmt('remaining_length_format', null, shortElapsed(c, left))) : ''}</span></div></div>
      <i class="ngqd-divider"></i>
      <div class="ngqd-saver${charging ? ' charging' : ''}"${charging ? '' : ' data-action="ngqd-saver" role="button"'}><span class="ngqd-saver-icon">${NG.batterySvg(100, false, true)}</span>
        <span class="ngqd-saver-title">${c.safe(t.t(charging ? 'battery_detail_charging_summary' : 'battery_detail_switch_title'))}</span>${charging ? '' : switchHtml(!!s.powerSave)}</div></div>`;
  }

  // ZenModeConfig.getFormattedTime: "hma" / "Hm" today, "EEE hma" / "EEE Hm" another day, the locale's best pattern.
  function formattedTime(c, at, weekday) {
    const locale = c.locale(), h24 = c.data.settings.time24 ?? !new Intl.DateTimeFormat(locale, {hour: 'numeric'}).resolvedOptions().hour12;
    return new Intl.DateTimeFormat(locale, {...(weekday ? {weekday: 'short'} : {}), hour: 'numeric', minute: '2-digit', hour12: !h24}).format(at);
  }
  // ZenModeConfig.toTimeCondition: line1 the duration (minutes under an hour, rounded hours under a day, else "Until …"),
  // line2 "Until …".
  function timeCondition(c, until, minutes, short) {
    const t = T(), at = new Date(until), time = formattedTime(c, at, at.toDateString() !== new Date().toDateString());
    const line2 = t.fmt('framework/zen_mode_until', null, time);
    if (minutes >= 1440) return {line1: line2, line2: ''};
    if (minutes >= 60) { const h = Math.round(minutes / 60); return {line1: t.plural(`framework/zen_mode_duration_hours${short ? '_short' : ''}`, h, null, h, time), line2}; }
    return {line1: t.plural(`framework/zen_mode_duration_minutes${short ? '_short' : ''}`, minutes, null, minutes, time), line2};
  }
  // The next alarm the clock has set (AlarmManager.getNextAlarmClock), when within six days from midnight.
  function nextAlarm(c) {
    const next = NG.clock?.nextAlarm?.(c);
    if (!next) return 0;
    const limit = new Date(); limit.setHours(0, 0, 0, 0); limit.setDate(limit.getDate() + 7);
    return next < limit.getTime() ? next : 0;
  }
  function zenPanel(c) {
    const s = c.data.settings, t = T(), st = c.ui.shade, zen = s.zen;
    if (st.bucket == null) st.bucket = s.zenBucket ?? DEFAULT_BUCKET;
    const segs = [[2, 'interruption_level_none_twoline', 'interruption_level_none_with_warning'], [3, 'interruption_level_alarms_twoline', 'interruption_level_alarms'], [1, 'interruption_level_priority_twoline', 'interruption_level_priority']]
      .map(([z, label, desc]) => `<button type="button" class="ngzp-seg${zen === z ? ' on' : ''}" data-action="ngzp-zen" data-zen="${z}" aria-label="${c.safe(t.t(desc))}">${c.safe(t.t(label)).replace(/\n/g, '<br>')}</button>`).join('');
    const intro = (zen === 1 && !s.zenIntroPriority) || (zen === 2 && !s.zenIntroSilence)
      ? `<div class="ngzp-intro"><button type="button" class="ngzp-confirm" data-action="ngzp-confirm" aria-label="${c.safe(t.t('accessibility_desc_close'))}"><img src="${A('sui-ic_close.svg')}" alt=""></button><p>${c.safe(t.t(zen === 1 ? 'zen_priority_introduction' : 'zen_silence_introduction'))}</p>${zen === 1 ? `<button type="button" class="ngzp-customize" data-action="ngzp-customize">${c.safe(t.t('zen_priority_customize_button'))}</button>` : ''}<i></i></div>`
      : '';
    const mode = !s.zenUntil ? 'forever' : s.zenAlarm ? 'alarm' : 'countdown';
    const until = mode === 'countdown' ? s.zenUntil : Date.now() + BUCKETS[st.bucket] * 60000;
    const tc = timeCondition(c, until, mode === 'countdown' ? Math.round((s.zenUntil - Date.now()) / 60000) : BUCKETS[st.bucket], false);
    const alarm = nextAlarm(c), ac = alarm ? timeCondition(c, alarm, Math.round((alarm - Date.now()) / 60000), true) : null;
    const radio = on => `<i class="ngzp-radio${on ? ' on' : ''}"></i>`;
    const row = (key, on, lines, extra = '') => `<div class="ngzp-cond" data-action="ngzp-cond" data-cond="${key}">${radio(on)}<span class="ngzp-lines"><span class="ngzp-l1">${c.safe(lines.line1)}</span>${lines.line2 ? `<span class="ngzp-l2">${c.safe(lines.line2)}</span>` : ''}</span>${extra}</div>`;
    const minus = st.bucket > 0, plus = st.bucket < BUCKETS.length - 1;
    const buttons = `<button type="button" class="ngzp-time${minus ? '' : ' end'}" data-action="ngzp-minus" aria-label="${c.safe(t.t('accessibility_quick_settings_less_time'))}"><img src="${A('sui-ic_qs_minus.svg')}" alt=""></button><button type="button" class="ngzp-time${plus ? '' : ' end'}" data-action="ngzp-plus" aria-label="${c.safe(t.t('accessibility_quick_settings_more_time'))}"><img src="${A('sui-ic_qs_plus.svg')}" alt=""></button>`;
    // computeAlarmWarningText: total silence with an alarm before the exit time (or none set).
    let warning = '';
    if (zen === 2 && alarm && (mode === 'forever' || alarm < s.zenUntil)) {
      const far = alarm - Date.now() >= 86400000, time = formattedTime(c, new Date(alarm), far);
      warning = t.fmt(mode === 'forever' ? 'zen_alarm_warning_indef' : 'zen_alarm_warning', null, t.fmt(far ? 'alarm_template_far' : 'alarm_template', null, time));
    }
    return `<div class="ngzp"><div class="ngzp-segs">${segs}</div>${intro}${zen ? `<div class="ngzp-conds">
      ${row('forever', mode === 'forever', {line1: t.t('zen_mode_forever'), line2: ''})}
      ${row('countdown', mode === 'countdown', tc, buttons)}
      ${ac ? row('alarm', mode === 'alarm', ac) : ''}</div>` : ''}${warning ? `<p class="ngzp-warning">${c.safe(warning)}</p>` : ''}</div>`;
  }

  function content(c, id) {
    const t = T(), s = c.data.settings;
    if (id === 'wifi') return items(c, s.wifi ? wifiItems(c) : [], {icon: 'sui-ic_qs_wifi_detail_empty.svg', text: t.t('quick_settings_wifi_detail_empty_text')}, s.wifi);
    if (id === 'bt') return items(c, s.bluetooth ? btItems(c) : [], {icon: 'sui-ic_qs_bluetooth_detail_empty.svg', text: t.t('quick_settings_bluetooth_detail_empty_text')}, s.bluetooth);
    if (id === 'cell') return dataUsage(c);
    if (id === 'battery') return battery(c);
    if (id === 'dnd') return zenPanel(c);
    return '';
  }

  function render(c, id) {
    const t = T(), toggle = toggleState(c, id), settings = SETTINGS[id];
    return `<div class="ngqd" role="region" aria-label="${c.safe(t.fmt('accessibility_quick_settings_detail', null, title(c, id)))}">
      <div class="ngqd-space"></div>
      <div class="ngqd-header${toggle === null ? '' : ' clickable'}"${toggle === null ? '' : ' data-action="ngqd-toggle" role="switch" aria-checked="' + toggle + '"'}><span class="ngqd-title">${c.safe(title(c, id))}</span>${toggle === null ? '' : switchHtml(toggle)}</div>
      <div class="ngqd-content">${content(c, id)}</div>
      <div class="ngqd-buttons">${settings ? `<button type="button" class="ngqd-more" data-action="ngqd-more">${c.safe(t.t('quick_settings_more_settings'))}</button>` : ''}<button type="button" class="ngqd-done" data-action="ngqd-done">${c.safe(t.t('quick_settings_done'))}</button></div>
    </div>`;
  }
  // The detail's own taps. ctl: {refresh, close (the shade), closeDetail}.
  function action(c, name, el, ctl) {
    const s = c.data.settings, st = c.ui.shade, id = st.detail, sy = sys();
    if (name === 'ngqd-done') { ctl.closeDetail(c); return true; }
    if (name === 'ngqd-more') { ctl.close(c); c.open('settings', SETTINGS[id]); return true; }
    if (name === 'ngqd-toggle') {
      const on = !toggleState(c, id);
      if (id === 'wifi') { sy.setWifi(c, on); ctl.closeDetail(c); }
      else if (id === 'bt') { sy.setBluetooth(c, on); ctl.closeDetail(c); }
      else if (id === 'cell') { sy.setMobileData(c, on); ctl.refresh(c); }
      else if (id === 'dnd') { if (!on) { sy.setZen(c, 0); ctl.closeDetail(c); } else { sy.setZen(c, s.zenFavorite || 3); ctl.refresh(c); } }
      return true;
    }
    if (name === 'ngqd-item') {
      const i = +el.dataset.index;
      if (id === 'wifi') {
        const ap = wifiItems(c)[i]?.ap; if (!ap) return true;
        if (!ap.active && !ap.saved && ap.secure) { ctl.close(c); c.open('settings', 'wifi'); return true; }
        if (!ap.active) sy.connectWifi(c, ap.ssid);
        ctl.closeDetail(c);
      } else if (id === 'bt') {
        const d = btItems(c)[i]?.d; if (d && !d.connected && !d.connecting) sy.btConnect(c, d.id);
      }
      return true;
    }
    if (name === 'ngqd-disconnect') { const d = btItems(c)[+el.dataset.index]?.d; if (d) sy.btDisconnect(c, d.id); return true; }
    if (name === 'ngqd-saver') { sy.setPowerSave(c, !s.powerSave); return true; }
    // ZenModePanel.
    if (name === 'ngzp-zen') { const z = +el.dataset.zen; s.zenFavorite = z; sy.setZen(c, z); return true; }
    if (name === 'ngzp-confirm') { if (s.zen === 1) s.zenIntroPriority = true; else s.zenIntroSilence = true; c.save(); ctl.refresh(c); return true; }
    if (name === 'ngzp-customize') { if (s.zen === 1) s.zenIntroPriority = true; c.save(); ctl.close(c); c.open('settings', 'zen-priority'); return true; }
    if (name === 'ngzp-cond') {
      const cond = el.dataset.cond;
      if (cond === 'forever') { s.zenUntil = 0; s.zenAlarm = false; }
      else if (cond === 'countdown') { s.zenUntil = Date.now() + BUCKETS[st.bucket] * 60000; s.zenAlarm = false; s.zenBucket = st.bucket; }
      else if (cond === 'alarm') { s.zenUntil = nextAlarm(c); s.zenAlarm = true; }
      c.save(); ctl.refresh(c); return true;
    }
    if (name === 'ngzp-minus' || name === 'ngzp-plus') {
      st.bucket = Math.max(0, Math.min(BUCKETS.length - 1, st.bucket + (name === 'ngzp-plus' ? 1 : -1)));
      s.zenUntil = Date.now() + BUCKETS[st.bucket] * 60000; s.zenAlarm = false; s.zenBucket = st.bucket;
      c.save(); ctl.refresh(c); return true;
    }
    return false;
  }

  NG.qsDetail = {has: id => id in SETTINGS, render, action};
})();
