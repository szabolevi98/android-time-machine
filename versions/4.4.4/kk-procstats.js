/* Developer options › Process Stats on the KTU84P (Nexus 5) image: Settings' ProcessStatsUi (process_stats_summary.xml), from
   android-4.4.4_r1's ProcessStatsUi, ProcessStatsPreference, ProcessStatsDetail:
   - the mem_status row: "<type> apps over <duration>" (Utils.formatElapsedTime without seconds) and "Device memory is
     currently <ram_states>", then the LinearColorPreference bar (red 0xaa5030, yellow 0xaaaa30, green 0x30aa50 for the
     critical, low + moderate and normal memory time);
   - one app_percentage_item row per process, sorted by weight (average PSS × time; USS with Use Uss), the bar relative
     to the heaviest, the text the share of the time; Show system adds the persistent processes to Background;
   - the menu: Refresh, Duration (3 hours … 1 day), Show system (Background only), Use Uss, Stats type (Background,
     Foreground, Cached);
   - a row opens Use details: the header, Force stop for app processes (forceStopPackage, then disabled), Average and
     Maximum RAM use (Formatter.formatShortFileSize), Run time and the process's services with their share.
   The processes, services and memory are the demo phone's (service names from the image's manifests). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (ctx, key) => { const row = window.StockStrings?.procstats?.[key]; return row ? AndroidStrings.pick(row, ctx.language, row.en || key) : key; };
  const F = (ctx, key, ...args) => AndroidStrings.format(S(ctx, key), ...args);
  const LP = false;
  // [icon, label, process, app uid, share of the time per stats type {bg, sys, fg, cached}, [avg, max] PSS MB, [avg, max] USS MB, services [name, %]]
  const PROCS = [
    ["gms-common_ic_googleplayservices.png", "Google Play services", "com.google.process.location", true, {"bg": 100}, [22.4, 27.9], [15.2, 19.1], [["NetworkLocationService", 100], ["GoogleLocationManagerService", 100], ["FusedLocationService", 100], ["GeofenceProviderService", 100]]],
    ["gms-common_ic_googleplayservices.png", "Google Play services", "com.google.process.gapps", true, {"bg": 100}, [28.6, 41.2], [19.8, 30.5], [["GoogleAccountDataService", 7], ["StatusService", 2]]],
    ["lime-ic_launcher_keyboard.png", "Google Keyboard", "com.google.android.inputmethod.latin", true, {"bg": 100, "fg": 0}, [33.1, 36.8], [26.4, 29.0], [["LatinIME", 100]]],
    ["google-search", "Google Search", "com.google.android.googlequicksearchbox:search", true, {"bg": 54, "cached": 31}, [47.2, 68.5], [35.9, 54.0], [["SearchService", 3], ["VelvetBackgroundTasksImpl$Service", 1]]],
    ["hangouts", "Hangouts", "com.google.android.talk", true, {"bg": 38, "fg": 6, "cached": 49}, [39.5, 52.7], [29.0, 40.2], [["RealTimeChatService", 38]]],
    ["gms-common_ic_googleplayservices.png", "Google Play services", "com.google.android.gms", true, {"bg": 21, "cached": 64}, [35.8, 50.3], [25.1, 37.7], [["GcmReceiverService", 4], ["CoreAnalyticsIntentService", 1]]],
    ["gmail", "Gmail", "com.google.android.gm", true, {"bg": 9, "fg": 4, "cached": 72}, [31.7, 42.0], [22.3, 30.6], [["MailSyncAdapterService", 9]]],
    ["play-store", "Google Play Store", "com.android.vending", true, {"bg": 4, "fg": 3, "cached": 41}, [40.2, 55.1], [28.8, 41.5], [["PackageVerificationService", 1]]],
    ["google-search", "Google Search", "com.google.android.googlequicksearchbox", true, {"fg": 62, "cached": 12}, [61.3, 84.6], [44.0, 62.8], []],
    ["settings", "Settings", "com.android.settings", true, {"fg": 11, "cached": 8}, [27.4, 33.9], [18.6, 23.4], []],
    ["chrome", "Chrome", "com.android.chrome", true, {"fg": 9, "cached": 37}, [58.9, 92.1], [41.7, 70.3], []],
    ["camera", "Camera", "com.google.android.GoogleCamera", true, {"fg": 2, "cached": 5}, [44.6, 71.0], [32.5, 55.2], []],
    ["sym_def_app_icon.png", "System UI", "com.android.systemui", false, {"sys": 100}, [52.8, 60.4], [38.3, 44.1], []],
    ["phone", "Phone", "com.android.phone", false, {"sys": 100}, [24.1, 26.7], [15.9, 17.4], []]
  ];
  // ProcessStats.ADJ_MEM_FACTOR_* time shares of the demo period: normal, moderate, low, critical.
  const MEM = [.96, .04, 0, 0];
  const DURATIONS = [['3 hours', 3 * 60], ['6 hours', 6 * 60], ['12 hours', 12 * 60], ['1 day', 24 * 60]];
  const TYPES = [['bg', 'Background'], ['fg', 'Foreground'], ['cached', 'Cached']];
  const state = ui => ui.procStats ||= {duration: 0, type: 'bg', system: false, uss: false, entry: '', stopped: []};
  // Utils.formatElapsedTime(context, millis, false): days, then hours and minutes.
  const elapsed = (ctx, minutes) => minutes >= 24 * 60 ? F(ctx, '%1$dd %2$dh %3$dm', Math.floor(minutes / 1440), Math.floor(minutes % 1440 / 60), minutes % 60) : F(ctx, '%1$dh %2$dm', Math.floor(minutes / 60), minutes % 60);
  // Formatter.formatShortFileSize: no decimals from 10 on.
  const size = mb => `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
  // Settings' percentage text on 4.4; 5.1's Utils.formatPercentage is the locale's NumberFormat percent.
  const percent = (ctx, value) => LP ? new Intl.NumberFormat(ctx.locale, {style: 'percent'}).format(value / 100) : F(ctx, '%d%%', value);
  function entries(ctx) {
    const st = state(ctx.ui), key = st.type === 'bg' && st.system ? 'sys' : st.type;
    const list = PROCS.map(([icon, label, proc, app, time, pss, uss, services]) => ({icon, label, proc, app, time: time[key] ?? (key === 'sys' ? time.bg : 0), pss, uss, services}))
      .filter(p => p.time > 0).map(p => ({...p, weight: (st.uss ? p.uss : p.pss)[0] * p.time}));
    list.sort((a, b) => b.weight - a.weight || b.time - a.time);
    const max = Math.max(1, ...list.map(p => p.weight));
    return list.map(p => ({...p, level: Math.ceil(p.weight / max * 100)}));
  }
  const icon = (ctx, name) => name.includes('.') ? `<img src="assets/${name}" alt="">` : ctx.appIcon(name);
  const bar = level => `<i><b style="width:${level}%"></b></i>`;
  function render(ctx) {
    const {ui} = ctx, st = state(ui), sub = ui.sub;
    const menu = `<button class="connectivity-overflow" data-action="ps-menu" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
    const refresh = `<button class="ps-refresh" data-action="ps-refresh" aria-label="${e(S(ctx, 'Refresh'))}"><img src="assets/ps-ic_menu_refresh_holo_dark.png" alt=""></button>`;
    if (sub === 'dev-procstats') {
      const list = entries(ctx), type = TYPES.find(([id]) => id === st.type)[1];
      const memory = S(ctx, `ram.${MEM.findIndex((share, i) => share === Math.max(...MEM)) || 0}`);
      const colors = `<${LP ? 'button' : 'div'} class="ps-colors"${LP ? ' data-action="ps-mem"' : ''}><span style="flex:${MEM[3]};background:#aa5030"></span><span style="flex:${MEM[1] + MEM[2]};background:#aaaa30"></span><span style="flex:${MEM[0]};background:#30aa50"></span></${LP ? 'button' : 'div'}>`;
      return {title: S(ctx, 'Process Stats'), right: refresh + menu,
        body: `<div class="settings-row ps-status"><span class="row-copy">${e(F(ctx, '%1$s apps over %2$s', S(ctx, type), elapsed(ctx, DURATIONS[st.duration][1])))}<small>${e(F(ctx, 'Device memory is currently %1$s', memory))}</small></span></div>${colors}`
          + list.map(p => `<button class="sd-usage-row ps-row" data-action="ps-entry" data-id="${e(p.proc)}">${icon(ctx, p.icon)}<span><span class="ps-line"><span>${e(p.label)}</span><small>${e(percent(ctx, p.time))}</small></span>${bar(p.level)}</span></button>`).join('')};
    }
    if (sub === 'dev-procstats-detail') {
      const p = entries(ctx).find(x => x.proc === st.entry); if (!p) return null;
      const stopped = st.stopped.includes(p.proc), item = (label, value) => `<div class="ps-detail-item"><b>${e(label)}</b><span>${e(value)}</span></div>`, mem = st.uss ? p.uss : p.pss;
      return {title: S(ctx, 'Use details'), body: `<div class="sd-usage-row ps-header">${icon(ctx, p.icon)}<span><span class="ps-line"><span>${e(p.label)}</span><small>${e(percent(ctx, p.time))}</small></span><em>${e(p.proc)}</em>${bar(p.level)}</span></div>`
        + (p.app ? `<div class="sd-buttons ps-buttons"><span></span><button data-action="ps-force-stop" ${stopped ? 'disabled' : ''}>${e(S(ctx, 'Force stop'))}</button></div>` : '')
        + `<div class="section-label">${e(LP ? S(ctx, 'Use details') : S(ctx, 'Use details').toLocaleUpperCase())}</div>${item(S(ctx, 'Average RAM use'), size(mem[0]))}${item(S(ctx, 'Maximum RAM use'), size(mem[1]))}${item(S(ctx, 'Run time'), percent(ctx, p.time))}`
        + (st.type === 'bg' && p.services.length ? `<div class="section-label">${e(LP ? S(ctx, 'Services') : S(ctx, 'Services').toLocaleUpperCase())}</div>${p.services.map(([name, share]) => item(name, percent(ctx, Math.min(share, p.time)))).join('')}` : '')};
    }
    if (LP && sub === 'dev-procstats-mem') {
      // ProcessStatsMemDetail: Memory states (the non-zero ones, formatShortElapsedTime) and Memory use.
      const total = DURATIONS[st.duration][1], row = (label, level, value) => `<div class="sd-usage-row ps-mem-row"><span><span class="ps-line"><span>${e(label)}</span><small>${e(value)}</small></span>${bar(Math.round(level * 100))}</span></div>`;
      const use = [], all = use.reduce((sum, [, mb]) => sum + mb, 0);
      return {title: S(ctx, 'Memory details'), body: `<div class="section-label">${e(S(ctx, 'Memory states'))}</div>${MEM.map((share, i) => share > 0 ? row(S(ctx, `mstate.${i}`), share, shortElapsed(ctx, Math.round(total * share))) : '').join('')}`
        + `<div class="section-label">${e(S(ctx, 'Memory use'))}</div>${use.map(([key, mb]) => row(S(ctx, key), mb / all, size(mb))).join('')}${row(S(ctx, 'Total'), 1, size(all))}`};
    }
    return null;
  }
  // Formatter.formatShortElapsedTime (5.1): days, hours with minutes under two hours, minutes.
  function shortElapsed(ctx, minutes) {
    const days = Math.floor(minutes / 1440), hours = Math.floor(minutes % 1440 / 60), mins = minutes % 60;
    if (days >= 2) return F(ctx, '%1$d days', days + Math.floor((hours + 12) / 24));
    if (days > 0) return F(ctx, hours === 1 ? '%1$d day %2$d hr' : '%1$d day %2$d hrs', days, hours);
    if (hours >= 2) return F(ctx, '%1$d hrs', hours + Math.floor((mins + 30) / 60));
    if (hours > 0) return F(ctx, mins === 1 ? '%1$d hr %2$d min' : '%1$d hr %2$d mins', hours, mins);
    return F(ctx, mins === 1 ? '%1$d min' : '%1$d mins', mins);
  }
  // The overflow menu and its two submenus, as Holo / Material popups with check marks.
  function overlay(ctx) {
    const {ui} = ctx, st = state(ui), check = on => `<span class="ps-check${on ? ' on' : ''}" aria-hidden="true"></span>`;
    const item = (action, id, label, on, disabled = false) => `<button data-action="${action}" data-id="${id}"${on === undefined ? '' : ` role="menuitemcheckbox" aria-checked="${on}"`} ${disabled ? 'disabled' : ''}><span>${e(label)}</span>${on === undefined ? '' : check(on)}</button>`;
    let items = '';
    if (ui.overlay === 'ps-menu') items = item('ps-sub', 'duration', S(ctx, 'Duration')) + item('ps-system', '', S(ctx, 'Show system'), st.system, st.type !== 'bg') + item('ps-uss', '', S(ctx, 'Use Uss'), st.uss) + item('ps-sub', 'type', S(ctx, 'Stats type'));
    else if (ui.overlay === 'ps-duration') items = DURATIONS.map(([label], i) => item('ps-duration', i, S(ctx, label), i === st.duration)).join('');
    else if (ui.overlay === 'ps-type') items = TYPES.map(([id, label]) => item('ps-type', id, S(ctx, label), id === st.type)).join('');
    else return '';
    const title = {'ps-duration': S(ctx, 'Duration'), 'ps-type': S(ctx, 'Stats type')}[ui.overlay];
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu ps-menu${title ? ' ps-submenu' : ''}">${title ? `<h3>${e(title)}</h3>` : ''}${items}</div>`;
  }
  function handle(action, id, ctx) {
    const {ui} = ctx, st = state(ui), close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'ps-menu': ui.overlay = 'ps-menu'; ctx.renderOverlay(); return true;
      case 'ps-sub': ui.overlay = 'ps-' + id; ctx.renderOverlay(); return true;
      case 'ps-refresh': ctx.render(); return true;
      case 'ps-system': st.system = !st.system; close(); ctx.render(); return true;
      case 'ps-uss': st.uss = !st.uss; close(); ctx.render(); return true;
      case 'ps-duration': st.duration = Number(id) || 0; close(); ctx.render(); return true;
      case 'ps-type': st.type = TYPES.some(([t]) => t === id) ? id : 'bg'; close(); ctx.render(); return true;
      case 'ps-entry': st.entry = id; ui.sub = 'dev-procstats-detail'; ctx.render(); return true;
      case 'ps-mem': if (LP) { ui.sub = 'dev-procstats-mem'; ctx.render(); } return true;
      case 'ps-force-stop': if (!st.stopped.includes(st.entry)) st.stopped.push(st.entry); ctx.render(); return true;
    }
    return false;
  }
  window.ProcStats = {PROCS, entries, render, overlay, handle};
})();
