/* Android 7.1.2 Settings: Data usage (com.android.settings.datausage of SettingsGoogle N2G48C), the screens 'data-usage',
   'data-list:mobile|wifi', 'data-app:<id>' and the hooks of billing_cycle, data_saver and data_usage_metered_prefs. The
   cycle and its use are ng-system.js's (DataUsageController); the share of each app is the simulator's own (6.0.1's split).
   - DataUsageSummary (data_usage.xml + data_usage_cellular / data_usage_wifi): the Usage category's SummaryPreference
     (settings_summary_preference.xml: the Display1 title in colorAccent, formatTitle's "%1$s cellular data" with all but
     the number at 0.64 size, the cycle under it; no chart without a limit), the limit summary ("2.00 GB Data warning",
     cell_warning_only), Data Saver (Off / On); Cellular: the Cellular data switch (CellDataPreference: turning it off asks
     data_usage_disable_mobile), Cellular data usage ("… used between …"), Billing cycle ("Monthly starting 1"); Wi-Fi:
     Wi-Fi data usage, Network restrictions. The overflow: Cellular networks, Help & feedback.
   - DataUsageList: apps_filter_spinner pinned under the action bar (the switch bar's #37474f, the cycle spinner 64 dp in,
     TextAppearance.Switch white; the ic_settings_24dp gear for the cellular template), data_usage_graph.xml (UsageView
     228 dp: the 56 dp side labels, the line and its fill in the accent from the cycle's start to today, the dates under
     it), "… used", the operator warning, then AppDataUsagePreference rows (data_usage_item / app_item: the 40 dp icon 16 dp
     before the Subhead label, the size at the end in textColorSecondary, widget_progress_bar under them).
   - AppDataUsage: Total / Foreground / Background, App settings, Background data, Unrestricted data usage.
   - BillingCycleSettings: Usage cycle reset date (the day dialog), Set data warning with the warning (2 GB by default),
     Set data limit (asking data_usage_limit_dialog_mobile) with the limit.
   - DataSaverSummary: the switch bar, Unrestricted data access, the framework's data_saver_description. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const S = c => c.data.settings;
  const A = name => `assets/${name}`;
  const H = NG.settingsHooks;
  const SHARES = [['gms', 31], ['chrome', 22], ['youtube', 18], ['android', 9], ['search', 7], ['play-store', 6], ['gmail', 4], ['maps', 3]];
  const GB = 1073741824;

  function cycle(c) {
    const now = new Date(), day = S(c).cycleDay || 1;
    const back = now.getDate() < day ? 1 : 0;
    const clamp = (y, m) => Math.min(day, new Date(y, m + 1, 0).getDate());
    const sy = now.getFullYear(), sm = now.getMonth() - back;
    const start = new Date(sy, sm, clamp(sy, sm)), next = new Date(sy, sm + 1, clamp(sy, sm + 1));
    return {start, end: new Date(next - 86400000), now};
  }
  const range = c => { const {start, end} = cycle(c), f = new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}); try { return f.formatRange(start, end); } catch { return `${f.format(start)} – ${f.format(end)}`; } };
  const usageOf = (c, tab) => { const u = NG.system.dataUsage(c); return tab === 'wifi' ? Math.round(u.usage * 4.2) : u.usage; };
  const warning = c => S(c).dataWarning ?? 2 * GB;
  const appLabel = (c, id) => id === 'gms' ? T().t('PrebuiltGmsCore/common_app_name') : id === 'android' ? T().t('process_kernel_label') : (NG.appsData[id]?.label[c.lang] || NG.appsData[id]?.label.en || id);
  const appIcon = id => id === 'gms' ? A('gms-common_ic_googleplayservices.png') : id === 'android' ? A('fw-sym_def_app_icon.png') : NG.appsData[id]?.icon;
  const apps = () => SHARES.filter(([id]) => id === 'gms' || id === 'android' || NG.appsData[id]);
  NG.appDataUsage = (c, id, tab = 'mobile') => Math.round(usageOf(c, tab) * (SHARES.find(([x]) => x === id)?.[1] || 0) / 100);
  NG.dataCycleRange = range;

  // formatTitle: the value big, the unit and the rest of the template at 0.64 of it.
  function title(c, template, bytes) {
    const parts = NG.fileSize(c, bytes, true).split(/\s+/), value = parts.shift(), unit = parts.join(' ');
    const size = `<b>${c.safe(value)}</b><small> ${c.safe(unit)}</small>`;
    return T().t(template).split('%1$s').map(p => `<small>${c.safe(p)}</small>`).join(size);
  }

  NG.settingsScreens['data-usage'] = {
    title: () => T().t('data_usage_summary_title'),
    actions: c => NG.menu.button(c),
    render(c) {
      const t = T(), s = S(c), u = usageOf(c, 'mobile'), items = [];
      items.push({html: NG.settingsCat(c, t.t('usage')), sel: false});
      items.push({html: `<button type="button" class="ngdu-summary" data-action="ngdu-list" data-tab="mobile"><span class="ngdu-title">${title(c, 'cell_data_template', u)}</span><span class="ngdu-period">${c.safe(range(c))}</span></button>`, sel: true});
      const lim = s.dataLimitOn ? t.fmt('cell_warning_and_limit', null, NG.fileSize(c, warning(c)), NG.fileSize(c, s.dataLimit || 2.2 * GB)) : s.dataWarningOn === false ? '' : t.fmt('cell_warning_only', null, NG.fileSize(c, warning(c)));
      items.push({html: lim ? `<div class="ngst-pref ngdu-limit"><span class="ngst-texts"><span class="ngst-summary">${c.safe(lim)}</span></span></div>` : '', sel: false});
      items.push({html: NG.settingsRow(c, {title: t.t('data_saver_title'), summary: t.t(s.dataSaver ? 'data_saver_on' : 'data_saver_off'), action: 'ngdu-saver'}), sel: true});
      items.push({html: NG.settingsCat(c, t.t('data_usage_tab_mobile')), sel: false});
      items.push({html: NG.settingsRow(c, {title: t.t('data_usage_enable_mobile'), widget: NG.settingsSwitch(!!s.mobileData), action: 'ngdu-mobile'}), sel: true});
      items.push({html: NG.settingsRow(c, {title: t.t('cellular_data_usage'), summary: t.fmt('data_usage_template', null, NG.fileSize(c, u), range(c)), action: 'ngdu-list', data: ' data-tab="mobile"'}), sel: true});
      items.push({html: NG.settingsRow(c, {title: t.t('billing_cycle'), summary: t.fmt('billing_cycle_fragment_summary', null, s.cycleDay || 1), action: 'ngdu-billing'}), sel: true});
      items.push({html: NG.settingsCat(c, t.t('wifi')), sel: false});
      items.push({html: NG.settingsRow(c, {title: t.t('wifi_data_usage'), summary: t.fmt('data_usage_template', null, NG.fileSize(c, usageOf(c, 'wifi')), range(c)), action: 'ngdu-list', data: ' data-tab="wifi"'}), sel: true});
      items.push({html: NG.settingsRow(c, {title: t.t('network_restrictions'), action: 'ngdu-metered'}), sel: true});
      return `<div class="ngst-list">${NG.settingsJoinRows(items.filter(i => i.html))}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'ng-menu') { c.menu([{label: t.t('data_usage_menu_cellular_networks'), action: c => NG.settingsGo(c, 'missing:com.android.phone.MobileNetworkSettings', t.t('data_usage_menu_cellular_networks'))}, {label: t.t('help_label'), action: c => c.open('help', 'settings')}], el); return true; }
      if (name === 'ngdu-list') { NG.settingsGo(c, `data-list:${el.dataset.tab}`, ''); return true; }
      if (name === 'ngdu-saver') { NG.settingsGo(c, 'xml:data_saver', t.t('data_saver_title')); return true; }
      if (name === 'ngdu-billing') { NG.settingsGo(c, 'xml:billing_cycle', t.t('billing_cycle')); return true; }
      if (name === 'ngdu-metered') { NG.settingsGo(c, 'xml:data_usage_metered_prefs', t.t('network_restrictions')); return true; }
      if (name === 'ngdu-mobile') {
        if (s.mobileData) c.dialog({message: t.t('data_usage_disable_mobile'), buttons: [{label: t.t('cancel')}, {label: t.t('framework/ok'), action: c => { NG.system.setMobileData(c, false); c.render(); }}]});
        else { NG.system.setMobileData(c, true); c.transition('none'); c.render(); }
        return true;
      }
      return false;
    }
  };

  // UsageView with the cumulative use from the cycle's start to today.
  function chart(c, bytes) {
    const {start, end, now} = cycle(c), days = (end - start) / 86400000 + 1, today = (now - start) / 86400000;
    const top = Math.max(bytes * 1.25, 1), W = 1000, H = 1000, x = d => d / days * W, y = b => H - b / top * H;
    let line = `M0 ${H}`;
    for (let i = 1; i <= Math.ceil(today); i++) { const d = Math.min(i, today); line += ` L${x(d).toFixed(1)} ${y(bytes * d / today).toFixed(1)}`; }
    const f = new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'});
    const labels = [top, top / 2, 0].map(b => `<span>${c.safe(NG.fileSize(c, b, true))}</span>`).join('');
    return `<div class="ngdu-usage"><div class="ngdu-graphrow"><div class="ngdu-side">${labels}</div><div class="ngdu-plot"><i></i><i></i><i></i><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${line} L${x(today).toFixed(1)} ${H} Z" class="fill"/><path d="${line}" class="line"/></svg></div></div>
      <div class="ngdu-dates"><span>${c.safe(f.format(start))}</span><span>${c.safe(f.format(end))}</span></div></div>`;
  }
  NG.settingsScreens['data-list'] = {
    title: (c, cur) => T().t(cur.screen.endsWith(':wifi') ? 'wifi_data_usage' : 'cellular_data_usage'),
    bar(c, cur) {
      const wifi = cur.screen.endsWith(':wifi');
      return `<div class="ngdu-header"><button type="button" class="ngdu-spinner" data-action="ngdu-cycles">${c.safe(range(c))}<i></i></button>${wifi ? '' : `<button type="button" class="ngdu-gear" data-action="ngdu-billing" aria-label="${c.safe(T().t('configure'))}"><i></i></button>`}</div>`;
    },
    render(c, cur) {
      const t = T(), tab = cur.screen.endsWith(':wifi') ? 'wifi' : 'mobile', u = usageOf(c, tab), max = SHARES[0][1];
      const rows = apps().map(([id, share]) => `<button type="button" class="ngdu-app" data-action="ngdu-app" data-app="${id}" data-tab="${tab}"><img src="${appIcon(id)}" alt=""><span class="ngdu-texts"><span class="ngdu-line"><span class="ngdu-label">${c.safe(appLabel(c, id))}</span><span class="ngdu-size">${c.safe(NG.fileSize(c, u * share / 100))}</span></span><span class="ngdu-bar"><i style="width:${(share / max * 100).toFixed(1)}%"></i></span></span></button>`);
      return `<div class="ngst-list">${chart(c, u)}${NG.settingsRow(c, {title: t.fmt('data_used_template', null, NG.fileSize(c, u)), summary: t.t('operator_warning'), div: true})}${rows.map(r => r).join('<i class="ngst-pdiv"></i>')}</div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'ngdu-app') { NG.settingsGo(c, `data-app:${el.dataset.app}:${el.dataset.tab}`, t.t('app_data_usage')); return true; }
      if (name === 'ngdu-billing') { NG.settingsGo(c, 'xml:billing_cycle', t.t('billing_cycle')); return true; }
      if (name === 'ngdu-cycles') { c.menu([{label: range(c), checked: true}], el); return true; }
      return false;
    }
  };
  NG.settingsScreens['data-app'] = {
    title: () => T().t('app_data_usage'),
    render(c, cur) {
      const t = T(), [, id, tab] = cur.screen.split(':'), total = NG.appDataUsage(c, id, tab), restricted = (S(c).bgRestricted || []).includes(id), unrestricted = (S(c).unrestrictedData || []).includes(id);
      const info = (title, v) => ({html: NG.settingsRow(c, {title, summary: NG.fileSize(c, v), div: true}), sel: false});
      const head = `<div class="ngdu-apphead"><img src="${appIcon(id)}" alt=""><span>${c.safe(appLabel(c, id))}</span></div>`;
      const items = [{html: `<div class="ngdu-cyclerow">${c.safe(range(c))}</div>`, sel: false}, info(t.t('total_size_label'), total), info(t.t('data_usage_label_foreground'), Math.round(total * .82)), info(t.t('data_usage_label_background'), total - Math.round(total * .82))];
      if (id !== 'android') {
        items.push({html: NG.settingsRow(c, {title: t.t('data_usage_app_settings'), action: 'ngdu-appsettings', data: ` data-app="${id}"`}), sel: true});
        items.push({html: NG.settingsRow(c, {title: t.t('data_usage_app_restrict_background'), summary: t.t('data_usage_app_restrict_background_summary'), widget: NG.settingsSwitch(!restricted), action: 'ngdu-bg', data: ` data-app="${id}"`}), sel: true});
        items.push({html: NG.settingsRow(c, {title: t.t('unrestricted_app_title'), summary: t.t('unrestricted_app_summary'), widget: NG.settingsSwitch(unrestricted, restricted), action: 'ngdu-unres', data: ` data-app="${id}"`, disabled: restricted}), sel: true});
      }
      return `<div class="ngst-list">${head}${NG.settingsJoinRows(items)}</div>`;
    },
    action(c, name, el) {
      const s = S(c), id = el.dataset.app;
      const toggle = key => { const list = s[key] || []; s[key] = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; c.save(); c.transition('none'); c.render(); };
      if (name === 'ngdu-bg') { toggle('bgRestricted'); return true; }
      if (name === 'ngdu-unres') { toggle('unrestrictedData'); return true; }
      if (name === 'ngdu-appsettings') { NG.settingsGo(c, `app:${id}`, ''); return true; }
      return false;
    }
  };

  // BillingCycleSettings.
  const bytesDialog = (c, titleKey, key, def) => {
    const t = T(), s = S(c), v = s[key] ?? def, inGb = v >= GB;
    let value = String(+(v / (inGb ? GB : 1048576)).toFixed(2)), unit = inGb ? 'gb' : 'mb';
    c.dialog({title: t.t(titleKey), html: `<div class="ngdu-bytes"><input type="number" min="0" step="0.01" class="ngst-input ngdu-num" value="${c.safe(value)}"><select class="ngwf-spinner ngdu-unit"><option value="mb"${unit === 'mb' ? ' selected' : ''}>${c.safe(t.t('framework/megabyteShort'))}</option><option value="gb"${unit === 'gb' ? ' selected' : ''}>${c.safe(t.t('framework/gigabyteShort'))}</option></select></div>`,
      buttons: [{label: t.t('cancel')}, {label: t.t('data_usage_cycle_editor_positive'), action: c => { const n = parseFloat(value); if (n >= 0) { s[key] = Math.round(n * (unit === 'gb' ? GB : 1048576)); c.save(); c.render(); } }}],
      mount(c, win) { win.querySelector('.ngdu-num').addEventListener('input', e => { value = e.target.value; }); win.querySelector('.ngdu-unit').addEventListener('change', e => { unit = e.target.value; }); }});
  };
  H.billing_cycle = {
    switch: ['set_data_warning', 'set_data_limit'],
    get(c, key) { const s = S(c); if (key === 'set_data_warning') return s.dataWarningOn !== false; if (key === 'set_data_limit') return !!s.dataLimitOn; return undefined; },
    set(c, key, v) { const s = S(c); if (key === 'set_data_warning') { s.dataWarningOn = v; return true; } if (key === 'set_data_limit') { s.dataLimitOn = v; return true; } return false; },
    disabled: (c, key) => (key === 'data_warning' && S(c).dataWarningOn === false) || (key === 'data_limit' && !S(c).dataLimitOn),
    summary(c, key) {
      const t = T(), s = S(c);
      if (key === 'billing_cycle') return t.fmt('billing_cycle_fragment_summary', null, s.cycleDay || 1);
      if (key === 'data_warning') return NG.fileSize(c, warning(c));
      if (key === 'data_limit') return NG.fileSize(c, s.dataLimit || 2.2 * GB);
      return undefined;
    },
    click(c, key) {
      const t = T(), s = S(c);
      if (key === 'billing_cycle') {
        let day = s.cycleDay || 1;
        c.dialog({title: t.t('data_usage_cycle_editor_title'), html: `<div class="ngdu-cycle"><div class="ngdu-cyclesub">${c.safe(t.t('data_usage_cycle_editor_subtitle'))}</div><input type="number" min="1" max="31" class="ngst-input ngdu-day" value="${day}"></div>`,
          buttons: [{label: t.t('cancel')}, {label: t.t('data_usage_cycle_editor_positive'), action: c => { const d = Math.min(31, Math.max(1, parseInt(day, 10) || 1)); s.cycleDay = d; c.save(); c.render(); }}],
          mount(c, win) { win.querySelector('.ngdu-day').addEventListener('input', e => { day = e.target.value; }); }});
        return true;
      }
      if (key === 'set_data_limit' && !s.dataLimitOn) {
        c.dialog({title: t.t('data_usage_limit_dialog_title'), message: t.t('data_usage_limit_dialog_mobile'), buttons: [{label: t.t('cancel')}, {label: t.t('framework/ok'), action: c => { s.dataLimitOn = true; c.save(); c.render(); }}]});
        return true;
      }
      if (key === 'data_warning') { bytesDialog(c, 'data_usage_warning_editor_title', 'dataWarning', 2 * GB); return true; }
      if (key === 'data_limit') { bytesDialog(c, 'data_usage_limit_editor_title', 'dataLimit', 2.2 * GB); return true; }
      return false;
    }
  };

  // DataSaverSummary.
  H.data_saver = {
    bar: c => NG.settingsSwitchBar(c, !!S(c).dataSaver, 'ngdu-saver-toggle'),
    action(c, name) { if (name === 'ngdu-saver-toggle') { NG.system.setDataSaver(c, !S(c).dataSaver); c.transition('none'); c.render(); return true; } return false; },
    summary(c, key) { if (key === 'unrestricted_access') { const n = (S(c).unrestrictedData || []).length; return T().plural('data_saver_unrestricted_summary', n); } return undefined; },
    click(c, key) { if (key === 'unrestricted_access') { NG.settingsGo(c, 'data-unrestricted', T().t('unrestricted_data_saver')); return true; } return false; }
  };
  NG.settingsScreens['data-unrestricted'] = {
    title: () => T().t('unrestricted_data_saver'),
    render(c) {
      const list = S(c).unrestrictedData || [], restricted = S(c).bgRestricted || [];
      const ids = Object.keys(NG.appsData).sort((a, b) => appLabel(c, a).localeCompare(appLabel(c, b)));
      return `<div class="ngst-list">${NG.settingsJoinRows(ids.map(id => ({html: NG.settingsRow(c, {title: appLabel(c, id), icon: `<img class="ngdu-appic" src="${appIcon(id)}" alt="">`, widget: NG.settingsSwitch(list.includes(id), restricted.includes(id)), action: 'ngdu-unres2', data: ` data-app="${id}"`, disabled: restricted.includes(id)}), sel: true})))}</div>`;
    },
    action(c, name, el) {
      if (name !== 'ngdu-unres2') return false;
      const s = S(c), id = el.dataset.app, list = s.unrestrictedData || [];
      s.unrestrictedData = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; c.save(); c.transition('none'); c.render();
      return true;
    }
  };
  // DataUsageMeteredSettings: the saved Wi-Fi networks, each Metered or not (mobile networks are always metered).
  const meteredRows = c => {
    const s = S(c), metered = s.meteredWifi || [];
    return NG.system.accessPoints(c).filter(ap => ap.saved).map(ap => ({html: NG.settingsRow(c, {title: ap.ssid, widget: NG.settingsSwitch(metered.includes(ap.ssid)), action: 'ngdu-metered-toggle', data: ` data-ssid="${c.safe(ap.ssid)}"`}), sel: true}));
  };
  NG.settingsScreens['xml:data_usage_metered_prefs'] = {
    title: () => T().t('network_restrictions'),
    render(c) {
      const t = T(), s = S(c), items = [{html: NG.settingsCat(c, t.t('data_usage_metered_wifi')), sel: false}];
      if (!s.wifi) items.push({html: NG.settingsRow(c, {title: '', summary: t.t('data_usage_metered_wifi_disabled'), div: true}), sel: false});
      else items.push(...meteredRows(c));
      items.push({html: NG.settingsRow(c, {title: '', summary: t.t('data_usage_metered_body'), div: true}), sel: false});
      return `<div class="ngst-list">${NG.settingsJoinRows(items)}</div>`;
    },
    action(c, name, el) {
      if (name !== 'ngdu-metered-toggle') return false;
      const s = S(c), ssid = el.dataset.ssid, list = s.meteredWifi || [];
      s.meteredWifi = list.includes(ssid) ? list.filter(x => x !== ssid) : [...list, ssid]; c.save(); c.transition('none'); c.render();
      return true;
    }
  };
})();
