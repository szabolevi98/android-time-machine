/* Android 7.1.2 Settings: Battery, Memory and Storage (SettingsGoogle N2G48C). The logic is 6.0.1's (its Battery,
   Memory and Storage code); N2G48C decides what differs:
   - PowerUsageSummary (power_usage_summary.xml): Battery saver (On / Off), BatteryHistoryPreference
     (battery_usage_graph: the level in 36 sp colorAccent, "Approx. … left" in textColorSecondary, settingslib's
     UsageView 141 dp high: battery_labels 100 % / 50 % / 0 % at the end in their 56 dp column, UsageGraph's 1 dp
     dividers, the 3 dp accent line with its fading fill, the projection to empty in usage_graph_dots #b0bec5 dots;
     under it charge_length_format "… ago" and remaining_length_format "… left"), then "Use since last full charge":
     PowerGaugePreference rows (the icon, tinted colorControlNormal for what is not an app, the label, the share at
     the end in preference_widget_summary). The overflow:
     Refresh (ic_menu_refresh, an action), Battery optimization; Usage alerts stay off (the Gservices flag
     settingsgoogle:additional_battery_info_enabled is false). The figures are the simulator's: the battery drops a
     percent every 4 minutes (ng-statusbar.js).
   - BatterySaverSettings: its switch bar, Turn on automatically (Never / at 5 % / at 15 %), the framework's
     battery_saver_description.
   - ProcessStatsSummary: the duration spinner (3 hours … 1 day), Average memory use: settings_summary_preference (the
     average in Display1 colorAccent, LinearColorBar 28 dp: running_processes_apps_ram against free), Performance,
     Total memory, Average used, Free, Memory used by apps (its list by average use). The 6P's 3 GB show about
     2.86 GB to Android.
   - StorageSettings with only the internal private volume opens PrivateVolumeSettings ("Internal shared storage",
     show_drawer_menu): storage_summary (the used size in 36 sp colorAccent, "Used of 32 GB": getPrimaryStorageSize
     rounds the userdata partition (26 503 790 080 bytes, BoardConfig.mk) and system to 32 GB, the 8 dp bar), then
     storage_item rows: Apps, Images, Videos, Audio, Other, Cached data, System (the 32 GB less the userdata partition),
     Explore; the overflow's Manage storage (Storage manager) and Explore. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const S = c => c.data.settings;
  const A = name => `assets/${name}`;
  const go = (c, screen, title) => NG.settingsGo(c, screen, title);
  const radio = (c, label, on) => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${on ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`});
  const pct = (c, v) => new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(v / 100);
  const label = (c, id) => NG.appsData[id]?.label[c.lang] || NG.appsData[id]?.label.en || id;
  const RATE = 240000;
  Object.assign(NG.settingsFragments, {'com.android.settings.fuelgauge.PowerUsageSummary': 'battery', 'com.android.settings.applications.ProcessStatsSummary': 'memory',
    'com.android.settings.deviceinfo.StorageSettings': 'storage', 'com.android.settings.deviceinfo.StorageWizardInit': 'storage'});

  // -- Battery --------------------------------------------------------------------------------------------------------
  const h24 = c => c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  function graph(c) {
    const t = T(), b = NG.battery(c), now = Date.now(), start = now - (100 - b.level) * RATE, end = now + b.level * RATE;
    const W = 1000, H = 300, x = v => ((v - start) / (end - start)) * W, y = l => H - l / 100 * H, xn = x(now).toFixed(1), yn = y(b.level).toFixed(1);
    // UsageView.setSideLabels: the array's last label on top.
    const labels = [...NG.settingsArr('array/battery_labels')].reverse();
    return `<div class="ngpu-graph"><div class="ngpu-charge">${c.safe(pct(c, b.level))}</div><div class="ngpu-est">${c.safe(t.fmt('power_remaining_duration_only', null, NG.shortElapsed(c, b.level * RATE)))}</div>
      <div class="ngpu-usage"><div class="ngpu-plot"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="ngpu-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#009688" stop-opacity=".2"/><stop offset="1" stop-color="#009688" stop-opacity="0"/></linearGradient></defs>
        <path d="M0 0H${W}M0 ${H / 2}H${W}M0 ${H}H${W}" stroke="#0000001f" stroke-width="2" vector-effect="non-scaling-stroke"/>
        <path d="M0 ${y(100)} L${xn} ${yn} L${xn} ${H} L0 ${H} Z" fill="url(#ngpu-fill)"/><path d="M0 ${y(100)} L${xn} ${yn}" stroke="#009688" stroke-width="3" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
        <path d="M${xn} ${yn} L${W} ${H}" stroke="#b0bec5" stroke-width="2.25" stroke-dasharray="0.75 7" stroke-linecap="round" fill="none" vector-effect="non-scaling-stroke"/></svg>
        <div class="ngpu-side">${labels.map(l => `<span>${c.safe(l)}</span>`).join('')}</div></div>
      <div class="ngpu-bottom"><span>${c.safe(t.fmt('charge_length_format', null, NG.shortElapsed(c, now - start)))}</span><span>${c.safe(t.fmt('remaining_length_format', null, NG.shortElapsed(c, end - now)))}</span></div></div></div>`;
  }
  // BatteryEntry's rows: the screen, Android OS, cell standby, Google Play services, Android System, phone idle,
  // Wi-Fi, then the apps the phone has run.
  function entries(c) {
    const t = T(), s = S(c), list = [
      ['screen', t.t('power_screen'), {mask: 'st-ic_settings_display.svg'}, 41], ['kernel', t.t('process_kernel_label'), {mask: 'st-ic_power_system.png'}, 15],
      ...(s.airplane ? [] : [['cell', t.t('power_cell'), {mask: 'st-ic_settings_cell_standby.png'}, 9]]),
      ['gms', t.t('PrebuiltGmsCore/common_app_name'), {img: 'gms-common_ic_googleplayservices.png'}, 7], ['system', t.t('framework/android_system_label'), {mask: 'st-ic_power_system.png'}, 6],
      ['idle', t.t('power_idle'), {mask: 'st-ic_settings_phone_idle.png'}, 4], ...(s.wifi ? [['wifi', t.t('power_wifi'), {mask: 'st-ic_settings_wireless.svg'}, 3]] : []),
      ...(c.data.recentApps || []).filter(id => NG.appsData[id]).slice(0, 3).map((id, i) => [`app:${id}`, label(c, id), {img: NG.appsData[id].icon.replace('assets/', '')}, [5, 3, 2][i]])];
    const sum = list.reduce((a, e) => a + e[3], 0);
    return list.sort((a, b) => b[3] - a[3]).map(([key, title, icon, v]) => ({key, title, icon, share: v / sum * 100}));
  }
  const icon = ic => ic.mask ? `<i class="ngst-ic masked" style="background:#0000008a;-webkit-mask-image:url('${A(ic.mask)}');mask-image:url('${A(ic.mask)}')"></i>` : `<img class="ngst-ic icon40" src="${A(ic.img)}" alt="">`;
  NG.settingsScreens.battery = {
    title: () => T().t('power_usage_summary_title'),
    actions: c => `<button type="button" class="ngst-ab-btn" data-action="ngpu-refresh" aria-label="${c.safe(T().t('menu_stats_refresh'))}"><img class="ngpu-refresh" src="${A('st-ic_menu_refresh_holo_dark.png')}" alt=""></button>${NG.menu.button(c)}`,
    render(c) {
      const t = T();
      const rows = entries(c).map(e => ({html: NG.settingsRow(c, {title: e.title, icon: icon(e.icon), widget: `<span class="ngpu-share">${c.safe(pct(c, Math.round(e.share)))}</span>`, action: 'ngpu-entry', data: ` data-key="${e.key}"`}), sel: true}));
      return `<div class="ngst-list">${NG.settingsJoinRows([{html: NG.settingsRow(c, {title: t.t('battery_saver'), summary: t.fmt(S(c).batterySaver ? 'battery_saver_on_summary' : 'battery_saver_off_summary', null, autoSummary(c)), action: 'ngpu-saver'}), sel: true},
        {html: graph(c), sel: true, above: true}, {html: NG.settingsCat(c, t.t('power_usage_list_summary')), sel: false}, ...rows])}</div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'ngpu-saver') { go(c, 'xml:battery_saver_settings', t.t('battery_saver')); return true; }
      if (name === 'ngpu-refresh') { c.transition('none'); c.render(); return true; }
      if (name === 'ng-menu') { c.menu([{label: t.t('high_power_apps'), action: c => go(c, 'high-power', t.t('high_power_apps'))}], el); return true; }
      if (name === 'ngpu-entry') { const k = el.dataset.key; if (k.startsWith('app:')) go(c, k, t.t('application_info_label')); else go(c, `batt:${k}`, t.t('details_title')); return true; }
      return false;
    }
  };
  // PowerUsageDetail for a device entry: its icon and share, the use details, the description.
  const DESC = {screen: ['battery_desc_display', 'battery_sugg_display', 'display'], kernel: ['battery_desc_apps', 'battery_sugg_apps_info'], cell: ['battery_desc_standby', 'battery_sugg_radio', 'wireless'],
    gms: ['battery_desc_apps', 'battery_sugg_apps_info'], system: ['battery_desc_apps', 'battery_sugg_apps_info'], idle: ['battery_desc_standby'], wifi: ['battery_desc_wifi', 'battery_sugg_wifi', 'wifi']};
  NG.settingsScreens.batt = {
    title: () => T().t('details_title'),
    render(c, cur) {
      const t = T(), key = cur.screen.split(':')[1], e = entries(c).find(x => x.key === key) || entries(c)[0], d = DESC[key] || DESC.kernel, mah = Math.round(3450 * e.share / 100 * (100 - NG.battery(c).level) / 100);
      return `<div class="ngst-list">${NG.settingsRow(c, {title: e.title, icon: icon(e.icon), widget: `<span class="ngpu-share">${c.safe(pct(c, Math.round(e.share)))}</span>`, div: true})}
        ${NG.settingsCat(c, t.t('details_title'))}${NG.settingsRow(c, {title: t.t('usage_type_computed_power'), widget: `<span class="ngpu-share">${c.safe(t.fmt('mah', null, mah))}</span>`, div: true})}
        <div class="ngsx-text">${c.safe(t.t(d[0]))}${d[1] ? `\n${c.safe(t.t(d[1]))}` : ''}</div>${d[2] ? `<div class="ngsx-btnrow"><button type="button" class="ngsx-btn" data-action="ngpu-open" data-to="${d[2]}">${c.safe(t.t({display: 'display_settings', wireless: 'radio_controls_title', wifi: 'wifi_settings'}[d[2]]))}</button></div>` : ''}</div>`;
    },
    action(c, name, el) { if (name !== 'ngpu-open') return false; c.open('settings', {display: 'display', wireless: 'wireless', wifi: 'wifi'}[el.dataset.to]); return true; }
  };
  // BatterySaverPreference: On / Off with the automatic setting.
  const autoSummary = c => { const v = S(c).batterySaverAt ?? 0; return v ? T().fmt('battery_saver_turn_on_automatically_pct', null, pct(c, v)) : T().t('battery_saver_turn_on_automatically_never'); };
  NG.settingsHooks.battery_saver_settings = {
    get: (c, key) => key === 'turn_on_automatically' ? String(S(c).batterySaverAt ?? 0) : undefined,
    summary(c, key) {
      return key === 'turn_on_automatically' ? autoSummary(c) : undefined;
    },
    click(c, key) {
      if (key !== 'turn_on_automatically') return false;
      const t = T(), cur = S(c).batterySaverAt ?? 0, opts = [0, 5, 15];
      c.dialog({title: t.t('battery_saver_turn_on_automatically_title'), items: opts.map(v => radio(c, v ? t.fmt('battery_saver_turn_on_automatically_pct', null, pct(c, v)) : t.t('battery_saver_turn_on_automatically_never'), v === cur)), buttons: [{label: t.t('dlg_cancel')}],
        onItem: i => { S(c).batterySaverAt = opts[i]; c.save(); c.render(); }});
      return true;
    },
    bar: c => NG.settingsSwitchBar(c, !!S(c).batterySaver, 'ngpu-batsaver'),
    action(c, name) { if (name !== 'ngpu-batsaver') return false; S(c).batterySaver = !S(c).batterySaver; c.save(); NG.system?.changed(c); c.transition('none'); c.render(); return true; }
  };

  // -- Memory ---------------------------------------------------------------------------------------------------------
  const DURATIONS = ['menu_duration_3h', 'menu_duration_6h', 'menu_duration_12h', 'menu_duration_1d'];
  const TOTAL_RAM = 2861137920;
  const mst = c => c.ui.memory || (c.ui.memory = {d: 0});
  const usedFor = d => [1395864371, 1438814044, 1481763717, 1524713390][d];
  NG.settingsMemory = c => ({used: usedFor(mst(c).d), total: TOTAL_RAM});
  function memApps(c) {
    const recent = c.data.recentApps || [], ids = Object.keys(NG.appsData).filter(id => !NG.appDisabled?.(c, id));
    const weight = id => (recent.includes(id) ? 60 - recent.indexOf(id) * 4 : 8) + (NG.appsData[id].codeSize % 7);
    const sum = ids.reduce((a, id) => a + weight(id), 0), pool = usedFor(mst(c).d) * .55;
    return ids.map(id => ({id, bytes: Math.round(pool * weight(id) / sum)})).sort((a, b) => b.bytes - a.bytes);
  }
  const spinner = c => `<div class="ngap-spinbar"><button type="button" class="ngap-spinner" data-action="ngpu-duration"><span>${c.safe(T().t(DURATIONS[mst(c).d]))}</span><i></i></button></div>`;
  const pickDuration = c => { const t = T(); c.dialog({items: DURATIONS.map((d, i) => radio(c, t.t(d), i === mst(c).d)), onItem: i => { mst(c).d = i; c.render(); }}); };
  const large = (c, bytes, short) => { const parts = NG.fileSize(c, bytes, short).split(/\s+/), unit = parts.pop(); return T().t('storage_size_large').split(/(\^[12])/).map(p => p === '^1' ? `<span>${c.safe(parts.join(' '))}</span>` : p === '^2' ? `<small>${c.safe(unit)}</small>` : c.safe(p)).join(''); };
  NG.settingsScreens.memory = {
    title: () => T().t('memory_settings_title'),
    bar: spinner,
    render(c) {
      const t = T(), used = usedFor(mst(c).d), free = TOTAL_RAM - used, ratio = used / TOTAL_RAM, n = memApps(c).length;
      const pair = (title, value) => `<div class="ngap-pair"><span>${c.safe(title)}</span><b>${c.safe(value)}</b></div>`;
      return `<div class="ngst-list">${NG.settingsCat(c, t.t('average_memory_use'))}<div class="ngpu-summary"><div class="ngpu-amount">${large(c, used, true)}</div><div class="ngpu-bar"><i style="width:${(ratio * 100).toFixed(1)}%"></i></div></div>
        <i class="ngap-space"></i>${pair(t.t('memory_performance'), NG.settingsArr('array/ram_states')[0])}${pair(t.t('total_memory'), NG.fileSize(c, TOTAL_RAM, true))}
        ${pair(t.t('average_used'), new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(Math.round(ratio * 100) / 100))}${pair(t.t('free_memory'), NG.fileSize(c, free, true))}<i class="ngap-space"></i>
        ${NG.settingsRow(c, {title: t.t('memory_usage_apps'), summary: t.plural('memory_usage_apps_summary', n, null, n, t.t(DURATIONS[mst(c).d])), action: 'ngpu-memapps'})}</div>`;
    },
    action(c, name) {
      if (name === 'ngpu-duration') { pickDuration(c); return true; }
      if (name === 'ngpu-memapps') { go(c, 'memory-apps', T().t('app_list_memory_use')); return true; }
      return false;
    }
  };
  NG.settingsScreens['memory-apps'] = {
    title: () => T().t('app_list_memory_use'),
    bar: spinner,
    render(c) {
      const list = memApps(c), max = list[0]?.bytes || 1;
      return `<div class="ngst-list">${list.map(a => `<button type="button" class="ngap-row" data-action="ngpu-memapp" data-app="${a.id}"><img src="${NG.appsData[a.id].icon}" alt=""><span class="ngap-texts"><span class="ngap-line"><span class="ngap-label">${c.safe(label(c, a.id))}</span><span class="ngap-size">${c.safe(NG.fileSize(c, a.bytes, true))}</span></span><span class="ngpu-appbar"><i style="width:${(a.bytes / max * 100).toFixed(1)}%"></i></span></span></button>`).join('')}</div>`;
    },
    action(c, name, el) {
      if (name === 'ngpu-duration') { pickDuration(c); return true; }
      if (name === 'ngpu-memapp') { go(c, `app:${el.dataset.app}`, T().t('application_info_label')); return true; }
      return false;
    }
  };

  // -- Storage --------------------------------------------------------------------------------------------------------
  const TOTAL = 34359738368, DATA = 26503790080;
  // The simulator's use of a set-up phone: app data, a few screenshots, no media, the rest of the system's data.
  const ITEMS = [['apps', 'storage_detail_apps', 1395864371], ['images', 'storage_detail_images', 13002342], ['videos', 'storage_detail_videos', 0],
    ['audio', 'storage_detail_audio', 0], ['other', 'storage_detail_other', 69206016]];
  const cached = c => S(c).cacheCleared ? 0 : 157286400;
  const DATA_SYSTEM = 1051721728;
  const used = c => ITEMS.reduce((a, i) => a + i[2], 0) + cached(c) + DATA_SYSTEM + (TOTAL - DATA);
  NG.settingsStorage = c => ({used: used(c), total: TOTAL});
  NG.settingsScreens.storage = {
    title: () => T().t('framework/storage_internal'),
    actions: c => NG.menu.button(c),
    render(c) {
      const t = T(), u = used(c), pctUsed = Math.floor(100 * u / TOTAL);
      const item = (key, title, bytes) => ({html: `<button type="button" class="ngpu-item" data-action="ngpu-item" data-key="${key}"><span class="ngpu-itemline"><span>${c.safe(title)}</span>${bytes != null ? `<small>${c.safe(NG.fileSize(c, bytes))}</small>` : ''}</span></button>`, sel: true});
      return `<div class="ngst-list">${NG.settingsJoinRows([{html: `<div class="ngpu-storage"><div class="ngpu-used">${large(c, u)}</div><div class="ngpu-of">${c.safe(t.fmt('storage_volume_used', null, NG.fileSize(c, TOTAL)))}</div><div class="ngpu-sbar"><i style="width:${pctUsed}%"></i></div></div>`, sel: true},
        ...ITEMS.map(([key, title, bytes]) => item(key, t.t(title), bytes)), item('cached', t.t('storage_detail_cached'), cached(c)), item('system', t.t('storage_detail_system'), TOTAL - DATA), item('explore', t.t('storage_menu_explore'), null)])}</div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'ng-menu') { c.menu([{label: t.t('storage_menu_manage'), action: c => go(c, 'xml:automatic_storage_management_settings', t.t('automatic_storage_manager_settings'))}, {label: t.t('storage_menu_explore'), action: c => c.open('documents', 'root:storage')}], el); return true; }
      if (name !== 'ngpu-item') return false;
      const key = el.dataset.key;
      if (key === 'apps') go(c, 'apps', t.t('apps_storage'));
      else if (key === 'cached') c.dialog({title: t.t('memory_clear_cache_title'), message: t.t('memory_clear_cache_message'), buttons: [{label: t.t('dlg_cancel')}, {label: t.t('okay'), action: c => { S(c).cacheCleared = true; c.save(); c.render(); }}]});
      else if (key === 'other') c.dialog({title: t.t('storage_detail_other'), message: t.t('storage_detail_dialog_other'), buttons: [{label: t.t('okay')}]});
      else if (key === 'system') c.dialog({title: t.t('storage_detail_system'), message: t.t('storage_detail_dialog_system'), buttons: [{label: t.t('okay')}]});
      else c.open('documents', `root:${key === 'explore' ? 'storage' : key}`);
      return true;
    }
  };
})();
/* GestureSettings (Moves) on the 6P: GesturePreference falls back to a plain switch row when its video does not play,
   and the 6P's gesture_*.mp4 are empty files in SettingsGoogle; Jump to camera (config_cameraDoubleTapPowerGestureEnabled),
   Swipe for notifications (config_supportSystemNavigationKeys), Flip camera (the vendor sensor HAL's "Double Twist"),
   pick-up for Ambient display (config_dozePulsePickup); double-tap for Ambient display goes (no
   config_dozeDoubleTapSensorType). Each keeps its Settings.Secure default: camera gestures on, swipe off, pick-up on (boolSettingDefaultOn). */
(() => {
  'use strict';
  const S = c => c.data.settings;
  const DEFAULTS = {gesture_double_tap_power: true, gesture_double_twist: true, gesture_swipe_down_fingerprint: false, gesture_pick_up: true};
  NG.settingsHooks.gesture_settings = {
    hidden: ['gesture_double_tap_screen'],
    switch: Object.keys(DEFAULTS),
    get: (c, key) => key in DEFAULTS ? (S(c).gestures?.[key] ?? DEFAULTS[key]) : undefined,
    set(c, key, v) { if (!(key in DEFAULTS)) return false; S(c).gestures = {...(S(c).gestures || {}), [key]: v}; return true; }
  };
})();
