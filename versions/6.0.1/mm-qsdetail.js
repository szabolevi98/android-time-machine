/* Android 6.0.1 quick settings details (SystemUI.apk, MTC20K), drawn by mm-shade.js inside the QS panel.
   - QSPanel.handleShowDetailImpl: qs_detail.xml over the tiles (system_primary_color, the grid's height at least, 8 dp
     padding below), the adapter's view on top and the buttons at the bottom end: MORE SETTINGS (button2, min 132 dp, 8 dp
     before DONE; gone without a settings intent) and DONE (button1, min 88 dp); TextAppearance.QS.DetailButton (14 sp
     sans-serif-medium caps #b0bec5, QSBorderlessButton 12 dp padding). It opens with a circular reveal from the tile's
     centre (QSDetailClipper).
   - StatusBarHeaderView shows qs_detail_header.xml instead of the clock and date: the adapter's title (20 sp
     sans-serif-medium) and, when getToggleState is not null, a Switch; clicking it calls setToggleState.
   - QSDetailItems (qs_detail_items.xml): 16 dp padding at the top and sides, rows of qs_detail_item.xml (48 dp minimum: a 24
     dp icon, 12 + 12 dp, the title at 16 sp and the summary 2 dp under it at 14 sp in system_accent_color, the 48 dp
     disconnect button, ic_qs_cancel), at most 7 (quick_settings_detail_max_item_count); with none, the 56 dp empty icon and its text
     20 dp under it (14 sp qs_subhead), centred.
   - WifiTile.WifiDetailAdapter: the access points as WifiTracker sorts them (the active one first, then by level, then by
     name), AccessPointControllerImpl's ic_qs_wifi_full_0..3 by WifiManager.calculateSignalLevel(rssi, 4) with
     qs_ic_wifi_lock over a secured one, the active one's summary from wifi_status ("Connected"); the toggle switches
     Wi-Fi and closes the detail; an open network connects and the shade collapses, a secured one opens Wi-Fi settings.
   - BluetoothTile: the paired devices (the simulator has none: "No paired devices available"); CastTile: the cast devices
     (none), no toggle; CellularTile: data_usage.xml (DataUsageDetailView, MobileDataControllerImpl: the cycle, the 2 GB
     default warning of NetworkPolicyManagerService, no limit; formatBytes with DecimalFormat("#.##"), KB below 100 KB, MB
     below 100 MB, else GB; DataUsageGraph: the 8 dp track #33ffffff, the usage in the accent, the 4 dp white warning
     marker), the toggle switches mobile data.
   - DndTile: ZenModePanel (zen_mode_panel.xml): SegmentedButtons Total silence / Alarms only / Priority only (72 dp, 16 sp,
     the selected one white sans-serif-medium, the others #b0bec5, on #14ffffff with 2 dp corners), the introduction for
     priority only and total silence until confirmed (#009688), the conditions: "Until you turn this off" and the
     countdown (ZenModeConfig.MINUTE_BUCKETS 15, 30, 45 minutes and 1 to 12 hours, one hour by default) with its minus
     and plus buttons (half transparent at the ends).
   - The user detail (UserDetailView, numColumns 3): the owner (activated: the accent ring and name), Guest and Add user. */
(() => {
  'use strict';
  const A = name => `assets/${name}`;
  const T = () => MM.text('qsdetail');
  const BUCKETS = [15, 30, 45, ...Array.from({length: 12}, (_, i) => (i + 1) * 60)];
  const DEFAULT_BUCKET = BUCKETS.indexOf(60);

  // The settings page each detail's MORE SETTINGS opens (the adapters' getSettingsIntent).
  const SETTINGS = {wifi: 'wifi', bt: 'bluetooth', cell: 'data-usage', cast: 'cast', dnd: 'zen', user: 'users'};
  const TITLES = {wifi: 'quick_settings_wifi_label', bt: 'quick_settings_bluetooth_label', cell: 'quick_settings_cellular_detail_title',
    cast: 'quick_settings_cast_title', dnd: 'quick_settings_dnd_label', user: 'quick_settings_user_title'};

  function toggleState(c, id) {
    const s = c.data.settings;
    if (id === 'wifi') return s.wifi;
    if (id === 'bt') return s.bluetooth;
    if (id === 'cell') return s.mobileData;
    if (id === 'dnd') return s.zen !== 0;
    return null;
  }

  function items(c, list, empty) {
    const t = c.safe;
    if (!list.length) return `<div class="mmqd-items"><div class="mmqd-empty"><img src="${A(empty.icon)}" alt=""><span>${t(empty.text)}</span></div></div>`;
    return `<div class="mmqd-items"><div class="mmqd-list${empty.hidden ? ' hidden' : ''}">${list.slice(0, 7).map((item, i) => `<button type="button" class="mmqd-item" data-action="mmqd-item" data-index="${i}">
      <span class="mmqd-icon"><img src="${A(item.icon)}" alt="">${item.overlay ? `<img src="${A(item.overlay)}" alt="">` : ''}</span>
      <span class="mmqd-text"><span class="mmqd-line1">${t(item.line1)}</span>${item.line2 ? `<span class="mmqd-line2">${t(item.line2)}</span>` : ''}</span>${item.canDisconnect ? `<span class="mmqd-close" data-action="mmqd-disconnect" data-index="${i}" role="button"><img src="${A('sui-ic_qs_cancel.svg')}" alt=""></span>` : ''}</button>`).join('')}</div></div>`;
  }

  // ZenModeConfig.getFormattedTime: the time ("hma" / "Hm" best pattern), with the weekday when it is not today.
  function formattedTime(c, at) {
    const locale = c.locale(), now = new Date(), h24 = c.data.settings.time24 ?? !new Intl.DateTimeFormat(locale, {hour: 'numeric'}).resolvedOptions().hour12;
    const sameDay = at.toDateString() === now.toDateString();
    return new Intl.DateTimeFormat(locale, {...(sameDay ? {} : {weekday: 'short'}), hour: 'numeric', minute: '2-digit', hour12: !h24}).format(at);
  }
  function timeCondition(c, minutes, until) {
    const t = T(), at = until ? new Date(until) : new Date(Date.now() + minutes * 60000), time = formattedTime(c, at);
    const line1 = minutes < 60 ? t.plural('zen_mode_duration_minutes', minutes) : t.plural('zen_mode_duration_hours', Math.round(minutes / 60));
    return {line1, line2: t.fmt('zen_mode_until', null, time)};
  }

  function zenPanel(c) {
    const s = c.data.settings, t = T(), st = c.ui.shade, sel = s.zen;
    if (st.bucket == null) st.bucket = s.zenBucket ?? DEFAULT_BUCKET;
    const buttons = [[2, 'interruption_level_none_twoline', 'interruption_level_none_with_warning'], [3, 'interruption_level_alarms_twoline', 'interruption_level_alarms'], [1, 'interruption_level_priority_twoline', 'interruption_level_priority']]
      .map(([zen, label, desc]) => `<button type="button" class="mmzp-seg${sel === zen ? ' on' : ''}" data-action="mmzp-zen" data-zen="${zen}" aria-label="${c.safe(t.t(desc))}">${c.safe(t.t(label)).replace(/\n/g, '<br>')}</button>`).join('');
    const intro = (sel === 1 && !s.zenIntroPriority) || (sel === 2 && !s.zenIntroSilence)
      ? `<div class="mmzp-intro"><button type="button" class="mmzp-close" data-action="mmzp-confirm" aria-label="${c.safe(t.t('accessibility_desc_close'))}"><img src="${A('sui-ic_close.svg')}" alt=""></button><p>${c.safe(t.t(sel === 1 ? 'zen_priority_introduction' : 'zen_silence_introduction'))}</p>${sel === 1 ? `<button type="button" class="mmzp-customize" data-action="mmzp-customize">${c.safe(t.t('zen_priority_customize_button'))}</button>` : ''}<i></i></div>`
      : '';
    const forever = !s.zenUntil, tc = timeCondition(c, BUCKETS[st.bucket], s.zenUntil);
    const minus = st.bucket > 0, plus = st.bucket < BUCKETS.length - 1;
    return `<div class="mmzp"><div class="mmzp-segs">${buttons}</div>${intro}<div class="mmzp-conds">
      <div class="mmzp-cond" data-action="mmzp-forever"><i class="mmw-radio${forever ? ' on' : ''}"></i><span class="mmzp-text"><span class="mmqd-line1">${c.safe(t.t('zen_mode_forever'))}</span></span></div>
      <div class="mmzp-cond" data-action="mmzp-time"><i class="mmw-radio${forever ? '' : ' on'}"></i><span class="mmzp-text"><span class="mmqd-line1">${c.safe(tc.line1)}</span><span class="mmqd-line2">${c.safe(tc.line2)}</span></span>
        <button type="button" class="mmzp-pm${minus ? '' : ' off'}" data-action="mmzp-less" aria-label="${c.safe(t.t('accessibility_quick_settings_less_time'))}"><img src="${A('sui-ic_qs_minus.svg')}" alt=""></button><button type="button" class="mmzp-pm${plus ? '' : ' off'}" data-action="mmzp-more" aria-label="${c.safe(t.t('accessibility_quick_settings_more_time'))}"><img src="${A('sui-ic_qs_plus.svg')}" alt=""></button></div>
    </div></div>`;
  }

  // DataUsageDetailView.formatBytes.
  function formatBytes(c, bytes) {
    const n = Math.abs(bytes);
    const [v, unit] = n > 104857600 ? [n / 1073741824, 'GB'] : n > 102400 ? [n / 1048576, 'MB'] : [n / 1024, 'KB'];
    return `${new Intl.NumberFormat(c.locale(), {maximumFractionDigits: 2, useGrouping: false}).format(Math.sign(bytes || 1) * v)} ${unit}`;
  }
  function dataUsage(c) {
    const t = T(), u = MM.system.dataUsage(c);
    const max = Math.max(u.limit, u.warning, u.usage), pct = x => (100 * x / max).toFixed(3);
    const marker = `left:calc(min(max(${pct(u.warning)}% - 2 * var(--dp), 0px), 100% - 4 * var(--dp)))`;
    return `<div class="mmdu"><div class="mmdu-title">${c.safe(t.t('quick_settings_cellular_detail_data_usage'))}</div>
      <div class="mmdu-usage">${c.safe(formatBytes(c, u.usage))}</div>
      <div class="mmdu-graph"><i style="width:${pct(u.usage)}%"></i><b style="${marker}"></b></div>
      <div class="mmdu-row"><span>${c.safe(u.carrier)}</span><span>${c.safe(t.fmt('quick_settings_cellular_detail_data_warning', null, formatBytes(c, u.warning)))}</span></div>
      <div class="mmdu-row mmdu-secondary"><span>${c.safe(u.period)}</span><span></span></div></div>`;
  }

  function userGrid(c) {
    const t = T();
    // UserSwitcherController's records: the owner, the users added, the guest (Remove guest while it is the current
    // user), Add user (mm-users.js).
    const U = MM.users, me = U ? U.current(c) : 'owner';
    const users = [{name: U ? U.ownerName() : t.t('owner_name'), icon: U ? U.icon('owner') : 'fw-ic_account_circle-user0.svg', current: me === 'owner', id: 'owner'},
      ...(U ? U.list() : []).map(x => ({name: x.name, icon: U.icon(x.id), current: me === x.id, id: x.id})),
      me === 'guest' ? {name: MM.text('users').t('guest_exit_guest'), icon: 'sui-ic_close.svg', current: true, id: 'guest'} : {name: t.t('guest_nickname'), icon: 'fw-ic_account_circle-guest.svg', id: 'guest'},
      {name: t.t('user_add_user'), icon: 'sui-ic_add_circle_qs.svg', id: 'add'}];
    // UserSwitcherController's refresh task puts the current user (the guest too) first, and Add user only while
    // UserManager.canAddMoreUsers() (fewer than config_multiuserMaximumUsers, 4, users besides the guest).
    const cur = users.findIndex(u => u.current); if (cur > 0) users.unshift(...users.splice(cur, 1));
    if (U && 1 + U.list().length >= 4) users.pop();
    return `<div class="mmud">${users.map(u => `<button type="button" class="mmud-item${u.current ? ' on' : ''}" data-action="mmud-user" data-user="${u.id}"><span class="mmud-avatar"><img src="${A(u.icon)}" alt=""></span><span class="mmud-name">${c.safe(u.name)}</span></button>`).join('')}</div>`;
  }

  // BluetoothDetailAdapter.updateItems: the bonded devices, connected (canDisconnect) or connecting with their icon.
  const bonded = c => MM.system.btDevices(c).filter(d => d.bonded);
  function btItems(c) {
    const t = T();
    return bonded(c).map(d => d.connected ? {icon: 'sui-ic_qs_bluetooth_connected.svg', line1: d.name, line2: t.t('quick_settings_connected'), canDisconnect: true}
      : d.connecting ? {icon: 'sui-ic_qs_bluetooth_connecting.svg', line1: d.name, line2: t.t('quick_settings_connecting')} : {icon: 'sui-ic_qs_bluetooth_on.svg', line1: d.name});
  }

  function content(c, id) {
    const t = T(), s = c.data.settings;
    if (id === 'wifi') {
      const list = MM.system.accessPoints(c).map(ap => ({icon: `sui-ic_qs_wifi_full_${ap.level}.svg`, overlay: ap.secure ? 'sui-qs_ic_wifi_lock.svg' : '', line1: ap.ssid, line2: ap.active ? t.t('wifi_status')[5] : ''}));
      return items(c, list, {icon: 'sui-ic_qs_wifi_detail_empty.svg', text: t.t('quick_settings_wifi_detail_empty_text'), hidden: !s.wifi});
    }
    if (id === 'bt') return items(c, btItems(c), {icon: 'sui-ic_qs_bluetooth_detail_empty.svg', text: t.t('quick_settings_bluetooth_detail_empty_text'), hidden: !s.bluetooth});
    if (id === 'cast') return items(c, [], {icon: 'sui-ic_qs_cast_detail_empty.svg', text: t.t('quick_settings_cast_detail_empty_text')});
    if (id === 'cell') return dataUsage(c);
    if (id === 'dnd') return zenPanel(c);
    if (id === 'user') return userGrid(c);
    return c.missing(`qs-${id}`);
  }

  MM.qsDetail = {
    has: id => id in TITLES,
    // The detail over the tiles; x / y (dp) is the tile's centre for the reveal.
    render(c, id, origin) {
      const t = T(), more = SETTINGS[id];
      const at = origin ? `--rx:calc(${origin.x.toFixed(2)} * var(--dp));--ry:calc(${origin.y.toFixed(2)} * var(--dp))` : '';
      return `<div class="mmqd${c.ui.shade.revealed ? '' : ' reveal'}" style="${at}"><div class="mmqd-content">${content(c, id)}</div>
        <div class="mmqd-buttons">${more ? `<button type="button" class="mmqd-button mmqd-more" data-action="mmqd-settings">${c.safe(t.t('quick_settings_more_settings'))}</button>` : ''}<button type="button" class="mmqd-button" data-action="mmqd-done">${c.safe(t.t('quick_settings_done'))}</button></div></div>`;
    },
    // qs_detail_header.xml in the header.
    header(c, id) {
      const toggle = toggleState(c, id);
      return `<div class="mmqd-head${toggle == null ? '' : ' clickable'}" data-action="${toggle == null ? 'mmqd-none' : 'mmqd-toggle'}"><span class="mmqd-title">${c.safe(T().t(TITLES[id]))}</span>${toggle == null ? '' : `<i class="mmw-switch${toggle ? ' on' : ''}"><i class="mmw-thumb"></i></i>`}</div>`;
    },
    // Wi-Fi and Bluetooth scan while their detail opens (QSTile.fireScanStateChanged): the progress line under the header.
    scanning: id => id === 'wifi' || id === 'bt',
    action(c, name, el, ctl) {
      const s = c.data.settings, st = c.ui.shade, id = st.detail, sys = MM.system;
      if (name === 'mmqd-none') return true;
      if (name === 'mmqd-done') { ctl.closeDetail(c); return true; }
      if (name === 'mmqd-settings') { c.closeOverlay(); c.open('settings', SETTINGS[id]); return true; }
      if (name === 'mmqd-toggle') {
        const on = !toggleState(c, id);
        if (id === 'wifi') { sys.setWifi(c, on); ctl.closeDetail(c); }
        else if (id === 'bt') { sys.setBluetooth(c, on); ctl.closeDetail(c); }
        else if (id === 'cell') { s.mobileData = on; c.save(); sys.changed(c); }
        else if (id === 'dnd') { sys.setZen(c, on ? s.zenFavorite || 3 : 0); if (!on) ctl.closeDetail(c); else ctl.refresh(c); }
        return true;
      }
      if (name === 'mmqd-item' && id === 'wifi') {
        const ap = sys.accessPoints(c)[+el.dataset.index];
        if (ap && !ap.active) {
          if (ap.secure && !ap.saved) { c.closeOverlay(); c.open('settings', 'wifi'); return true; }
          sys.connectWifi(c, ap.ssid); ctl.close(c);
        } else ctl.closeDetail(c);
        return true;
      }
      if (name === 'mmqd-disconnect' && id === 'bt') { const d = bonded(c)[+el.dataset.index]; if (d) sys.btDisconnect(c, d.id); ctl.refresh(c); return true; }
      if (name === 'mmqd-item' && id === 'bt') {
        const d = bonded(c)[+el.dataset.index];
        if (d && !d.connected && !d.connecting) { sys.btConnect(c, d.id); ctl.refresh(c); setTimeout(() => c.ui.overlay === 'shade' && ctl.refresh(c), 1600); }
        return true;
      }
      if (name === 'mmzp-zen') { const zen = +el.dataset.zen; s.zenFavorite = zen; sys.setZen(c, zen); ctl.refresh(c); return true; }
      if (name === 'mmzp-confirm') { if (s.zen === 1) s.zenIntroPriority = true; else s.zenIntroSilence = true; c.save(); ctl.refresh(c); return true; }
      if (name === 'mmzp-customize') { c.closeOverlay(); c.open('settings', 'zen-priority'); return true; }
      if (name === 'mmzp-forever') { s.zenUntil = 0; c.save(); ctl.refresh(c); return true; }
      if (name === 'mmzp-time' || name === 'mmzp-less' || name === 'mmzp-more') {
        if (name !== 'mmzp-time') st.bucket = Math.max(0, Math.min(BUCKETS.length - 1, st.bucket + (name === 'mmzp-more' ? 1 : -1)));
        s.zenBucket = st.bucket; s.zenUntil = Date.now() + BUCKETS[st.bucket] * 60000; c.save(); ctl.refresh(c); return true;
      }
      if (name === 'mmud-user') {
        const id = el.dataset.user, me = MM.users?.current(c) || 'owner';
        if (id === 'guest' || id === 'add') { c.closeOverlay(); c.overlay(id === 'guest' ? 'user-guest' : 'user-add'); return true; }
        if (id === me) { ctl.closeDetail(c); return true; }
        c.closeOverlay(); MM.users.switchTo(c, id); return true;
      }
      return false;
    }
  };
})();
