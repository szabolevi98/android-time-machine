/* Android 6.0.1 Settings: Data usage (DataUsageSummary, Settings.apk MTC20K), MM.settingsScreens['data-usage'].
   - data_usage_summary.xml with the Cellular tab alone (Wi-Fi only after Show Wi-Fi): data_usage_header.xml's network
     switches (Cellular data, Set cellular data limit), data_usage_cycles.xml (the cycle in the spinner as
     DateUtils.formatDateRange gives it, its total at the end), data_usage_chart.xml (228 dp: 16 dp above, 40 dp at the
     right, 24 dp below; ChartGridView's data_grid_border with the cycle's first and last day in Caption,
     ChartNetworkSeriesView's cumulative use in the accent, ChartSweepView's warning line data_sweep_warning_activated
     with "^1 ^2 warning" in data_usage_sweep_warning's sizes), the disclaimer, then the apps (data_usage_item.xml:
     app_item with the bytes and a bar against the largest).
   - Turning Cellular data off asks data_usage_disable_mobile; Set cellular data limit explains data_usage_limit_dialog.
   - The overflow menu: Restrict background data, Show Wi-Fi, Cellular networks (one SIM: no SIM cards).
   - The cycle and its use are mm-system.js's (MobileDataControllerImpl's figures, as the Quick Settings detail shows);
     the share of each app is the simulator's own. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const S = c => c.data.settings;
  // The simulator's split of the cycle's use between the apps (Google Play services, Chrome, YouTube …).
  const SHARES = [['gms', 31], ['chrome', 22], ['youtube', 18], ['android', 9], ['search', 7], ['play-store', 6], ['gmail', 4], ['maps', 3]];

  // The cycle runs from the policy's cycle day (NetworkPolicy.cycleDay, 1 by default; CycleEditor sets it) to the day
  // before it next month.
  function cycle(c) {
    const now = new Date(), day = S(c).cycleDay || 1;
    const back = now.getDate() < day ? 1 : 0;
    const clamp = (y, m) => Math.min(day, new Date(y, m + 1, 0).getDate());
    const sy = now.getFullYear(), sm = now.getMonth() - back;
    const start = new Date(sy, sm, clamp(sy, sm)), next = new Date(sy, sm + 1, clamp(sy, sm + 1));
    return {start, end: new Date(next - 86400000), now};
  }
  // Wi-Fi's use in the cycle: the simulator's own figure, a few times the cellular one.
  const usageOf = (c, tab) => { const u = MM.system.dataUsage(c); return tab === 'wifi' ? {...u, usage: u.usage * 4.2, warning: 0} : u; };
  MM.appDataUsage = (c, id, tab) => { const share = SHARES.find(([x]) => x === id)?.[1] || 0; return Math.round(usageOf(c, tab).usage * share / 100); };
  MM.dataCycleStart = c => new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}).format(cycle(c).start);
  MM.dataUsageChart = (c, bytes) => chart(c, {usage: bytes, warning: 0});
  function chart(c, u) {
    const t = T(), {start, end, now} = cycle(c);
    const days = (end - start) / 86400000 + 1, today = (now - start) / 86400000;
    const max = Math.max(u.usage, u.warning, 1) * 1.2, W = 1000, H = 1000;
    const x = d => d / days * W, y = b => H - b / max * H;
    // A steady day-by-day use up to now.
    let d = `M0 ${H}`;
    for (let i = 0; i <= Math.ceil(today); i++) { const day = Math.min(i, today); d += ` L${x(day).toFixed(1)} ${y(u.usage * day / today).toFixed(1)}`; }
    d += ` L${x(today).toFixed(1)} ${H} Z`;
    const fmt = date => new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}).format(date);
    const parts = MM.fileSize(c, u.warning).split(/\s+/), unit = parts.pop(), value = parts.join(' ');
    const label = t.t('data_usage_sweep_warning').split(/(\^[12])/).map(p => p === '^1' ? `<b>${c.safe(value)}</b>` : p === '^2' ? `<small>${c.safe(unit)}</small>` : `<em>${c.safe(p)}</em>`).join('');
    return `<div class="mmdu-chart"><div class="mmdu-plot np-st-data_grid_border"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${d}" fill="#009688"/></svg>
        ${u.warning ? `<div class="mmdu-sweep" style="top:${(y(u.warning) / H * 100).toFixed(2)}%"><span class="mmdu-label">${label}</span><i class="np-st-data_sweep_warning_activated"></i></div>` : ''}</div>
      <div class="mmdu-dates"><span>${c.safe(fmt(start))}</span><span>${c.safe(fmt(end))}</span></div></div>`;
  }
  // Show Wi-Fi adds data_usage_summary's tabs (Cellular, Wi-Fi); the Wi-Fi tab has no network switches or warning.
  const tabOf = c => S(c).showWifi && c.ui.dataTab === 'wifi' ? 'wifi' : 'mobile';
  function render(c) {
    const t = T(), s = S(c), tab = tabOf(c), u = usageOf(c, tab), {start, end} = cycle(c);
    let range;
    try { range = new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}).formatRange(start, end); } catch { range = u.period; }
    const sw = (key, label, on) => `<button type="button" class="mmst-pref" data-action="mmdu-switch" data-key="${key}"><span class="mmst-texts"><span class="mmst-title">${c.safe(label)}</span></span><span class="mmst-widget"><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></span></button>`;
    const label = id => id === 'gms' ? t.t('PrebuiltGmsCore/common_app_name') : id === 'android' ? t.t('process_kernel_label') : MM.appLabel(c, id);
    const icon = id => id === 'gms' ? 'assets/gms-ic_google.png' : id === 'android' ? 'assets/st-ic_power_system.png' : MM.appsData[id]?.icon;
    const max = SHARES[0][1];
    const tabs = s.showWifi ? `<div class="mmdu-tabs">${[['mobile', 'data_usage_tab_mobile'], ['wifi', 'data_usage_tab_wifi']].map(([k, l]) => `<button type="button" class="${tab === k ? 'on' : ''}" data-action="mmdu-tab" data-tab="${k}">${c.safe(t.t(l))}</button>`).join('')}</div>` : '';
    const apps = SHARES.filter(([id]) => id === 'gms' || id === 'android' || MM.appsData[id]).map(([id, share]) => `<button type="button" class="mmap-row" data-action="mmdu-app" data-app="${id}"><img src="${icon(id)}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${c.safe(label(id))}</span><span class="mmap-size">${c.safe(MM.fileSize(c, u.usage * share / 100))}</span></span><span class="mmbt-bar"><i style="width:${(share / max * 100).toFixed(1)}%"></i></span></span></button>`).join('');
    return `<div class="mmst-list">${tabs}${tab === 'wifi' ? '' : `<div class="mmdu-switches">${sw('mobile', t.t('data_usage_enable_mobile'), s.mobileData)}<i class="mmst-divider full"></i>${sw('limit', t.t('data_usage_disable_mobile_limit'), !!s.dataLimit)}</div>`}<i class="mmst-divider full"></i>
      <div class="mmdu-cycle"><button type="button" class="mmdu-spinner" data-action="mmdu-cycle">${c.safe(range)}<i></i></button><span>${c.safe(MM.fileSize(c, u.usage))}</span></div>
      ${chart(c, u)}<div class="mmdu-disclaimer">${c.safe(t.t('data_usage_disclaimer'))}</div><i class="mmdu-pad"></i>${apps}</div>`;
  }
  MM.settingsScreens['data-usage'] = {
    title: () => T().t('data_usage_summary_title'),
    render,
    actions: c => MM.menu.button(c),
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'mm-menu') {
        c.menu([{label: t.t('data_usage_menu_restrict_background'), action: c => c.dialog({title: t.t('data_usage_restrict_background_title'), message: t.t('data_usage_restrict_background'),
            buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { s.restrictBackground = true; c.save(); }}]})},
          {label: t.t(s.showWifi ? 'data_usage_menu_hide_wifi' : 'data_usage_menu_show_wifi'), action: c => { s.showWifi = !s.showWifi; if (!s.showWifi) c.ui.dataTab = 'mobile'; c.save(); c.render(); }},
          {label: t.t('data_usage_menu_cellular_networks'), action: c => MM.openPrefs(c, 'network', 'network_setting')}]);
        return true;
      }
      if (name === 'mmdu-switch') {
        if (el.dataset.key === 'mobile') {
          if (s.mobileData) c.dialog({message: t.t('data_usage_disable_mobile'), buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { s.mobileData = false; c.save(); MM.system.changed(c); c.render(); }}]});
          else { s.mobileData = true; c.save(); MM.system.changed(c); c.render(); }
        } else if (!s.dataLimit) {
          c.dialog({title: t.t('data_usage_limit_dialog_title'), message: t.t('data_usage_limit_dialog_mobile'), buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { s.dataLimit = true; c.save(); c.render(); }}]});
        } else { s.dataLimit = false; c.save(); c.render(); }
        return true;
      }
      if (name === 'mmdu-app') {
        const id = el.dataset.app;
        MM.settingsGo(c, `data-app:${id}`, t.t('data_usage_app_summary_title'));
        return true;
      }
      if (name === 'mmdu-tab') { c.ui.dataTab = el.dataset.tab; c.render(); return true; }
      // The cycle spinner: the current cycle and Change cycle…, which opens CycleEditor (a NumberPicker of the day, 1–31).
      if (name === 'mmdu-cycle') {
        c.menu([{label: t.t('data_usage_change_cycle'), action: c => {
          let day = s.cycleDay || 1;
          const draw = win => { const col = win.querySelector('.mmsx-picker'); col.innerHTML = [day - 1, day, day + 1].map((d, i) => `<button type="button" data-d="${i - 1}" class="${i === 1 ? 'cur' : ''}">${d < 1 || d > 31 ? '' : d}</button>`).join(''); };
          c.dialog({title: t.t('data_usage_cycle_editor_title'), html: `<div class="mmsx-cycle"><span>${c.safe(t.t('data_usage_cycle_editor_subtitle'))}</span><div class="mmsx-picker"></div></div>`,
            mount(c, win) {
              draw(win);
              const col = win.querySelector('.mmsx-picker');
              col.addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return; e.stopPropagation(); day = Math.min(31, Math.max(1, day + +b.dataset.d)); draw(win); });
              col.addEventListener('wheel', e => { e.preventDefault(); day = Math.min(31, Math.max(1, day + Math.sign(e.deltaY))); draw(win); }, {passive: false});
            },
            buttons: [{label: t.t('cancel')}, {label: t.t('data_usage_cycle_editor_positive'), action: c => { s.cycleDay = day; c.save(); c.render(); }}]});
        }}]);
        return true;
      }
      return false;
    }
  };
})();
