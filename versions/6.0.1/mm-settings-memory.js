/* Android 6.0.1 Settings: Memory (ProcessStatsSummary and its App usage list, Settings.apk MTC20K),
   MM.settingsScreens.memory / 'memory-apps'.
   - ProcessStatsBase pins the duration spinner (apps_filter_spinner.xml: 3 hours, 6 hours, 12 hours, 1 day) above
     process_stats_summary.xml: proc_stats_ui.xml (the average used memory in storage_size_large, Display1 in the
     accent, the 28 dp LinearColorBar in running_processes_apps_ram #009587 against running_processes_free_ram #ced7db),
     the horizontal_preference rows Performance (ram_states), Total memory and Free (formatShortFileSize), Average used
     (Utils.formatPercentage), then App usage (memory_usage_apps_summary).
   - App usage (ProcessStatsUi): the apps by their average use, each ProcessStatsPreference with its size and a bar.
   - The figures are the simulator's: the 5X's 2 GB of RAM shows about 1.8 GB to Android; the use grows a little with
     the period. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const DURATIONS = ['menu_duration_3h', 'menu_duration_6h', 'menu_duration_12h', 'menu_duration_1d'];
  const TOTAL = 1932735283;
  const st = c => c.ui.memory || (c.ui.memory = {d: 0});
  const usedFor = d => [1288490188, 1331439861, 1374389534, 1417339207][d];
  // Each app's average, a share of what the apps use (the launcher apps first, those recently run more).
  function apps(c) {
    const recent = c.data.recentApps || [], ids = Object.keys(MM.appsData).filter(id => !MM.appDisabled?.(c, id));
    const weight = id => (recent.includes(id) ? 60 - recent.indexOf(id) * 4 : 8) + (MM.appsData[id].codeSize % 7);
    const sum = ids.reduce((a, id) => a + weight(id), 0), pool = usedFor(st(c).d) * .55;
    return ids.map(id => ({id, bytes: Math.round(pool * weight(id) / sum)})).sort((a, b) => b.bytes - a.bytes);
  }
  MM.memoryApps = apps;
  function large(c, bytes) {
    const parts = MM.fileSize(c, bytes, true).split(/\s+/), unit = parts.pop(), value = parts.join(' ');
    return T().t('storage_size_large').split(/(\^[12])/).map(p => p === '^1' ? `<span>${c.safe(value)}</span>` : p === '^2' ? `<small>${c.safe(unit)}</small>` : c.safe(p)).join('');
  }
  const bar = c => `<div class="mmst-spinbar"><button type="button" class="mmst-spinner" data-action="mmme-duration"><span>${c.safe(T().t(DURATIONS[st(c).d]))}</span><i></i></button></div>`;
  function render(c) {
    const t = T(), used = usedFor(st(c).d), free = TOTAL - used, ratio = used / TOTAL;
    const row = (title, summary) => `<div class="mmme-row"><span>${c.safe(title)}</span><span>${c.safe(summary)}</span></div>`;
    const n = apps(c).length;
    return `<div class="mmst-list"><div class="mmst-cat">${c.safe(t.t('average_memory_use'))}</div>
      <div class="mmme-head"><div class="mmme-state">${large(c, used)}</div><div class="mmme-bar"><i style="width:${(ratio * 100).toFixed(1)}%"></i></div></div>
      ${row(t.t('memory_performance'), t.t('ram_states')[0])}${row(t.t('total_memory'), MM.fileSize(c, TOTAL, true))}
      ${row(t.t('average_used'), new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(Math.round(ratio * 100) / 100))}${row(t.t('free_memory'), MM.fileSize(c, free, true))}
      <i class="mmme-space"></i><button type="button" class="mmst-pref" data-action="mmme-apps"><span class="mmst-texts"><span class="mmst-title">${c.safe(t.t('memory_usage_apps'))}</span><span class="mmst-summary">${c.safe(t.plural('memory_usage_apps_summary', n, null, n, t.t(DURATIONS[st(c).d])))}</span></span></button></div>`;
  }
  function pickDuration(c) {
    const t = T();
    c.dialog({items: DURATIONS.map((d, i) => ({html: `<span class="mmst-choice"><i class="mmw-radio${i === st(c).d ? ' on' : ''}"></i><span>${c.safe(t.t(d))}</span></span>`})), onItem: i => { st(c).d = i; c.render(); }});
  }
  MM.settingsScreens.memory = {
    title: () => T().t('memory_settings_title'),
    render, bar,
    action(c, name) {
      if (name === 'mmme-duration') { pickDuration(c); return true; }
      if (name === 'mmme-apps') { MM.settingsGo(c, 'memory-apps', T().t('app_list_memory_use')); return true; }
      return false;
    }
  };
  MM.settingsScreens['memory-apps'] = {
    title: () => T().t('app_list_memory_use'),
    bar,
    render(c) {
      const list = apps(c), max = list[0]?.bytes || 1;
      return `<div class="mmst-list">${list.map(a => `<button type="button" class="mmap-row" data-action="mmme-app" data-app="${a.id}"><img src="${MM.appsData[a.id].icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${c.safe(MM.appLabel(c, a.id))}</span><span class="mmap-size">${c.safe(MM.fileSize(c, a.bytes, true))}</span></span><span class="mmbt-bar"><i style="width:${(a.bytes / max * 100).toFixed(1)}%"></i></span></span></button>`).join('')}</div>`;
    },
    action(c, name, el) {
      if (name === 'mmme-duration') { pickDuration(c); return true; }
      if (name === 'mmme-app') { MM.settingsGo(c, `mem-app:${el.dataset.app}`, MM.appLabel(c, el.dataset.app)); return true; }
      return false;
    }
  };
})();
