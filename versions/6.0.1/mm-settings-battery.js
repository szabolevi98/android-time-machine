/* Android 6.0.1 Settings: Battery (PowerUsageSummary, Settings.apk MTC20K), MM.settingsScreens.battery, and
   Formatter.formatShortElapsedTime as MM.elapsed.
   - BatteryHistoryPreference (battery_history_chart.xml): BatteryHistoryChart's header in textAppearanceMedium,
     "%1$s - approx. %2$s left" (power_discharging_duration: Utils.formatPercentage and formatShortElapsedTime) or the
     charging forms, over the chart (chartMinHeight 120 dp): the level since the last full charge filled in
     barPrimaryColor (colorControlActivated #009688), the prediction to empty in material_empty_color_light #ced7db,
     the start and end times under it in textAppearanceSmall.
   - "Use since last full charge" (power_usage_list_summary): AppProgressPreference rows (preference_app.xml: the 40 dp
     icon, the label, the share of the total at the end, under it the bar relative to the largest): BatteryEntry's
     Screen (ic_settings_display), Android OS (ic_power_system), Cell standby, Google Play services, Android System,
     Phone idle, Wi-Fi, then the apps the phone has run. The figures are the simulator's: the battery left 100 % 13 x 4
     minutes before the page loaded and drops a percent every 4 minutes (mm-statusbar.js).
   - The overflow menu: Battery saver (battery_saver_settings.xml with its switch bar: Never / at 5 % / at 15 %) and
     Battery optimization. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const F = () => MM.text('framework');
  const RATE = 240000;   // ms per percent

  // Formatter.formatShortElapsedTime: 2 days and more in days, a day with hours, 2 hours and more in hours, an hour with
  // minutes, then minutes.
  MM.elapsed = (c, ms) => {
    const f = F(); let s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); s -= m * 60;
    if (d >= 2) return f.fmt('durationDays', null, d + Math.floor((h + 12) / 24));
    if (d > 0) return f.fmt(h === 1 ? 'durationDayHour' : 'durationDayHours', null, d, h);
    if (h >= 2) return f.fmt('durationHours', null, h + Math.floor((m + 30) / 60));
    if (h > 0) return f.fmt(m === 1 ? 'durationHourMinute' : 'durationHourMinutes', null, h, m);
    if (m >= 2) return f.fmt('durationMinutes', null, m + Math.floor((s + 30) / 60));
    return f.fmt('durationMinute', null, Math.max(1, m));
  };
  const pct = (c, v) => new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(v / 100);

  function chart(c) {
    const b = MM.battery(), now = Date.now(), start = now - (100 - b.level) * RATE, end = now + b.level * RATE;
    const W = 1000, H = 300, x = t => ((t - start) / (end - start)) * W, y = l => H - l / 100 * H;
    const used = `M0 ${H} L0 ${y(100)} L${x(now).toFixed(1)} ${y(b.level).toFixed(1)} L${x(now).toFixed(1)} ${H} Z`;
    const pred = `M${x(now).toFixed(1)} ${H} L${x(now).toFixed(1)} ${y(b.level).toFixed(1)} L${W} ${H} Z`;
    const time = t => new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit', hour12: !(c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12)}).format(t);
    const head = T().fmt('power_discharging_duration', null, pct(c, b.level), MM.elapsed(c, b.level * RATE));
    return `<div class="mmbt-chart"><div class="mmbt-head">${c.safe(head)}</div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${pred}" fill="#ced7db"/><path d="${used}" fill="#009688"/></svg>
      <div class="mmbt-times"><span>${c.safe(time(new Date(start)))}</span><span>${c.safe(time(new Date(end)))}</span></div></div>`;
  }
  function entries(c) {
    const t = T(), s = c.data.settings, list = [
      ['screen', t.t('power_screen'), {mask: 'st-ic_settings_display_am_alpha.png'}, 41], ['kernel', t.t('process_kernel_label'), {img: 'st-ic_power_system.png'}, 15],
      ...(s.airplane ? [] : [['cell', t.t('power_cell'), {img: 'st-ic_settings_cell_standby.png'}, 9]]),
      ['gms', t.t('PrebuiltGmsCore/common_app_name'), {img: 'gms-ic_google.png'}, 7], ['system', t.t('framework/android_system_label'), {img: 'st-ic_power_system.png'}, 6],
      ['idle', t.t('power_idle'), {img: 'st-ic_settings_phone_idle.png'}, 4], ...(s.wifi ? [['wifi', t.t('power_wifi'), {mask: 'st-ic_settings_wireless_alpha.png'}, 3]] : []),
      ...(c.data.recentApps || []).filter(id => MM.appsData[id]).slice(0, 3).map((id, i) => [`app:${id}`, MM.appLabel(c, id), {img: MM.appsData[id].icon.replace('assets/', '')}, [5, 3, 2][i]])];
    const total = list.reduce((a, e) => a + e[3], 0), max = Math.max(...list.map(e => e[3]));
    return list.sort((a, b) => b[3] - a[3]).map(([key, label, icon, v]) => ({key, label, icon, share: v / total * 100, of: v / max * 100}));
  }
  MM.batteryEntries = entries;
  function render(c) {
    const t = T();
    const rows = entries(c).map(e => `<button type="button" class="mmap-row" data-action="mmbt-entry" data-key="${e.key}">${e.icon.mask ? `<i class="mmbt-ic" style="-webkit-mask-image:url('assets/${e.icon.mask}');mask-image:url('assets/${e.icon.mask}')"></i>` : `<img src="assets/${e.icon.img}" alt="">`}<span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${c.safe(e.label)}</span><span class="mmap-size">${c.safe(pct(c, Math.round(e.share)))}</span></span><span class="mmbt-bar"><i style="width:${Math.ceil(e.of)}%"></i></span></span></button>`).join('');
    return `<div class="mmst-list">${chart(c)}<div class="mmst-cat">${c.safe(t.t('power_usage_list_summary'))}</div>${rows}</div>`;
  }
  MM.settingsScreens.battery = {
    title: () => T().t('power_usage_summary_title'),
    render,
    actions: c => MM.menu.button(c),
    action(c, name, el) {
      const t = T();
      if (name === 'mm-menu') {
        c.menu([{label: t.t('battery_saver'), action: c => MM.settingsGo(c, 'xml:battery_saver_settings', t.t('battery_saver'))},
          {label: t.t('high_power_apps'), action: c => MM.settingsGo(c, 'high-power', t.t('high_power_apps'))}]);
        return true;
      }
      if (name === 'mmbt-entry') {
        const key = el.dataset.key;
        if (key.startsWith('app:')) MM.settingsGo(c, key, t.t('application_info_label'));
        else MM.settingsGo(c, `batt:${key}`, T().t('details_title'));
        return true;
      }
      return false;
    }
  };

  // battery_saver_settings (BatterySaverSettings): the switch bar (low_power), Turn on automatically from
  // low_power_trigger_level (0: Never).
  const S = c => c.data.settings;
  MM.settingsHooks.battery_saver_settings = {
    get: (c, key) => key === 'turn_on_automatically' ? String(S(c).batterySaverAt ?? 0) : undefined,
    summary(c, key) {
      if (key !== 'turn_on_automatically') return undefined;
      const v = S(c).batterySaverAt ?? 0;
      return v ? T().fmt('battery_saver_turn_on_automatically_pct', null, pct(c, v)) : T().t('battery_saver_turn_on_automatically_never');
    },
    click(c, key) {
      if (key !== 'turn_on_automatically') return false;
      const t = T(), cur = S(c).batterySaverAt ?? 0, opts = [0, 5, 15];
      c.dialog({items: opts.map(v => ({html: `<span class="mmst-choice"><i class="mmw-radio${v === cur ? ' on' : ''}"></i><span>${c.safe(v ? t.fmt('battery_saver_turn_on_automatically_pct', null, pct(c, v)) : t.t('battery_saver_turn_on_automatically_never'))}</span></span>`})),
        onItem: i => { S(c).batterySaverAt = opts[i]; c.save(); c.render(); }});
      return true;
    }
  };
  MM.settingsScreens['xml:battery_saver_settings'] = {
    bar(c) {
      const on = !!S(c).batterySaver, t = T();
      return `<button type="button" class="mmst-switchbar" data-action="mmbs-toggle"><span>${c.safe(t.t(on ? 'switch_on_text' : 'switch_off_text'))}</span><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></button>`;
    },
    action(c, name) { if (name !== 'mmbs-toggle') return false; S(c).batterySaver = !S(c).batterySaver; c.save(); c.render(); return true; }
  };
})();
