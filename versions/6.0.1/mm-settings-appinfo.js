/* Android 6.0.1 Settings: the pages under App info (Settings.apk MTC20K) and the notification apps list.
   - Storage (AppStorageSettings, app_storage_settings.xml): app_item's header, Storage used: Internal storage with the
     Change button (greyed: no adoptable storage), the Storage category (Total, App, USB storage app, Data, SD card data
     in horizontal_preference rows) with Clear data (clear_data_dlg_title / clear_data_dlg_text), then Cache with Clear
     cache. The app's size is its APK and oat files (mm-apps.js); its data and cache are the simulator's own figures,
     kept at zero once cleared.
   - Notifications (AppNotificationSettings, app_notification_settings.xml): the app header, Block all, Treat as
     priority, Allow peeking (gone while blocked), Sensitive content hidden only with a secure lock and notifications on
     the lock screen; App settings only for an app with a notification preferences activity (none here). App info's
     summary: Block, else the chosen flags joined, else Normal. Sound & notification > App notifications
     (ManageApplications, LIST_TYPE_NOTIFICATION) lists the apps with that summary.
   - Open by default (AppLaunchSettings, installed_app_launch_settings.xml): for an app with http(s) links
     (mm-domains.js) Open supported links (Open in this app / Ask every time / Don't open in this app) and Supported
     links (domain_urls_summary_one / _some, the list in a dialog); Other defaults: auto_launch_disable_text with Clear
     defaults greyed.
   - Data usage (DataUsageSummary's app detail, data_usage_app_details.xml): the app's header, App settings, the cycle
     chart, Foreground and Background, Restrict app background data (asks data_usage_app_restrict_dialog). */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const S = c => c.data.settings;
  const esc = (c, s) => c.safe(s);
  const label = (c, id) => id === 'gms' ? T().t('PrebuiltGmsCore/common_app_name') : id === 'android' ? T().t('process_kernel_label') : MM.appLabel(c, id);
  const icon = id => id === 'gms' ? 'assets/gms-ic_google.png' : id === 'android' ? 'assets/st-ic_power_system.png' : MM.appsData[id]?.icon;
  const header = (c, id, sub = '') => `<div class="mmai-head"><div class="mmap-row static"><img src="${icon(id)}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${esc(c, label(c, id))}</span></span>${sub ? `<span class="mmap-sub">${esc(c, sub)}</span>` : ''}</span></div></div>`;
  const row = (c, title, summary, attrs = '') => `<div class="mmst-pref"${attrs}><span class="mmst-texts"><span class="mmst-title">${esc(c, title)}</span>${summary ? `<span class="mmst-summary">${esc(c, summary)}</span>` : ''}</span></div>`;
  const pair = (c, title, value) => `<div class="mmsx-pair"><span>${esc(c, title)}</span><b>${esc(c, value)}</b></div>`;
  const button = (c, action, text, disabled = false) => `<div class="mmsx-btnrow"><button type="button" class="mmsx-btn" data-action="${action}"${disabled ? ' disabled' : ''}>${esc(c, text)}</button></div>`;

  // -- Storage -------------------------------------------------------------------------------------------------------
  // A stable per-app figure from its package name (the simulator's data and cache use).
  const hash = s => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const usage = (c, id) => {
    const a = MM.appsData[id], h = hash(a.pkg), cleared = (S(c).appCleared || {})[id] || {};
    return {app: a.codeSize, data: cleared.data ? 0 : 24576 * (4 + h % 900), cache: cleared.cache ? 0 : 4096 * (h % 2000)};
  };
  const total = (c, id) => { const u = usage(c, id); return u.app + u.data + u.cache; };
  MM.appTotalSize = total;
  MM.settingsScreens['app-storage'] = {
    title: () => T().t('application_info_label'),
    render(c, cur) {
      const t = T(), id = cur.screen.split(':')[1], u = usage(c, id), f = n => MM.fileSize(c, n);
      return `<div class="mmst-list">${header(c, id)}${pair(c, t.t('storage_used'), t.t('storage_type_internal'))}${button(c, 'mmsx-change', t.t('change'), true)}
        <div class="mmst-cat">${esc(c, t.t('storage_label'))}</div>${pair(c, t.t('total_size_label'), f(u.app + u.data))}${pair(c, t.t('application_size_label'), f(u.app))}${pair(c, t.t('external_code_size_label'), f(0))}
        ${pair(c, t.t('data_size_label'), f(u.data))}${pair(c, t.t('external_data_size_label'), f(0))}${button(c, 'mmsx-cleardata', t.t('clear_user_data_text'), !u.data || !MM.appData.canClear(id))}
        <i class="mmsx-space"></i>${pair(c, t.t('cache_size_label'), f(u.cache))}${button(c, 'mmsx-clearcache', t.t('clear_cache_btn_text'), !u.cache)}</div>`;
    },
    action(c, name, el, cur) {
      const t = T(), id = cur.screen.split(':')[1], s = S(c);
      const clear = what => { s.appCleared = {...(s.appCleared || {}), [id]: {...((s.appCleared || {})[id] || {}), [what]: true}}; c.save(); c.render(); };
      if (name === 'mmsx-cleardata') { c.dialog({title: t.t('clear_data_dlg_title'), message: t.t('clear_data_dlg_text'), buttons: [{label: t.t('dlg_cancel')}, {label: t.t('dlg_ok'), action: () => { if(MM.appData.clear(c,id)){clear('data');clear('cache');} }}]}); return true; }
      if (name === 'mmsx-clearcache') { MM.appData.clearCache(c,id); clear('cache'); return true; }
      return false;
    }
  };

  // -- Notifications -------------------------------------------------------------------------------------------------
  const notif = (c, id) => (S(c).appNotif || {})[id] || {};
  const secureLock = c => ['pin', 'password', 'pattern'].includes(S(c).lock?.type);
  function notifSummary(c, id) {
    const t = T(), n = notif(c, id);
    if (n.block) return t.t('notifications_disabled');
    const parts = [n.priority && t.t('notifications_priority'), n.sensitive && secureLock(c) && t.t('notifications_sensitive')].filter(Boolean);
    return parts.length ? parts.join(', ') : t.t('notifications_enabled');
  }
  MM.appNotifSummary = notifSummary;
  MM.appNotifBlocked = (c, id) => !!notif(c, id).block;
  const sw = (c, key, title, summary, on, disabled = false) => `<button type="button" class="mmst-pref${disabled ? ' disabled' : ''}" data-action="mmsx-notif" data-key="${key}"${disabled ? ' disabled' : ''}><span class="mmst-texts"><span class="mmst-title">${esc(c, title)}</span><span class="mmst-summary">${esc(c, summary)}</span></span><span class="mmst-widget"><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></span></button>`;
  MM.settingsScreens['app-notif'] = {
    title: () => T().t('app_notifications_title'),
    render(c, cur) {
      const t = T(), id = cur.screen.split(':')[1], n = notif(c, id);
      const lockShows = S(c).lockNotifications ?? true;
      return `<div class="mmst-list">${header(c, id)}${sw(c, 'block', t.t('app_notification_block_title'), t.t('app_notification_block_summary'), n.block)}
        ${sw(c, 'priority', t.t('app_notification_priority_title'), t.t('app_notification_priority_summary'), n.priority, n.block)}
        ${n.block ? '' : sw(c, 'peekable', t.t('app_notification_peekable_title'), t.t('app_notification_peekable_summary'), n.peekable ?? true)}
        ${secureLock(c) && lockShows ? sw(c, 'sensitive', t.t('app_notification_sensitive_title'), t.t('app_notification_sensitive_summary'), n.sensitive, n.block) : ''}</div>`;
    },
    action(c, name, el, cur) {
      if (name !== 'mmsx-notif') return false;
      const id = cur.screen.split(':')[1], s = S(c), n = {...notif(c, id)}, k = el.dataset.key;
      n[k] = !(k === 'peekable' ? n.peekable ?? true : n[k]);
      s.appNotif = {...(s.appNotif || {}), [id]: n}; c.save(); c.render();
      return true;
    }
  };
  MM.settingsScreens['apps-notif'] = {
    title: () => T().t('app_notifications_title'),
    render(c) {
      const col = new Intl.Collator(c.locale(), {sensitivity: 'base'}), seen = new Set();
      const ids = Object.keys(MM.appsData).filter(id => { const p = MM.appsData[id].pkg; if (seen.has(p) || MM.appDisabled?.(c, id)) return false; seen.add(p); return true; }).sort((a, b) => col.compare(MM.appLabel(c, a), MM.appLabel(c, b)));
      return `<div class="mmst-list">${ids.map(id => `<button type="button" class="mmap-row" data-action="mmsx-notifapp" data-app="${id}"><img src="${MM.appsData[id].icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${esc(c, MM.appLabel(c, id))}</span></span><span class="mmap-sub">${esc(c, notifSummary(c, id))}</span></span></button>`).join('')}</div>`;
    },
    action(c, name, el) { if (name !== 'mmsx-notifapp') return false; MM.settingsGo(c, `app-notif:${el.dataset.app}`, T().t('app_notifications_title')); return true; }
  };

  // -- Open by default -----------------------------------------------------------------------------------------------
  const LINK = ['app_link_open_always', 'app_link_open_ask', 'app_link_open_never'];
  const linkState = (c, id) => (S(c).appLinks || {})[id] ?? 1;
  MM.appLaunchSummary = (c, id) => T().t(MM.appDomains?.[id] && linkState(c, id) === 0 ? 'launch_defaults_some' : 'launch_defaults_none');
  MM.settingsScreens['app-launch'] = {
    title: () => T().t('application_info_label'),
    render(c, cur) {
      const t = T(), id = cur.screen.split(':')[1], hosts = MM.appDomains?.[id] || [], st = linkState(c, id);
      const links = hosts.length ? `<div class="mmst-cat">${esc(c, t.t('app_launch_domain_links_title'))}</div>
        <button type="button" class="mmst-pref" data-action="mmsx-linkstate"><span class="mmst-texts"><span class="mmst-title">${esc(c, t.t('app_launch_open_domain_urls_title'))}</span><span class="mmst-summary">${esc(c, t.t(LINK[st]))}</span></span></button>
        <button type="button" class="mmst-pref${st === 2 ? ' disabled' : ''}" data-action="mmsx-domains"${st === 2 ? ' disabled' : ''}><span class="mmst-texts"><span class="mmst-title">${esc(c, t.t('app_launch_supported_domain_urls_title'))}</span><span class="mmst-summary">${esc(c, t.fmt(hosts.length > 1 ? 'domain_urls_summary_some' : 'domain_urls_summary_one', null, hosts[0]))}</span></span></button>` : '';
      return `<div class="mmst-list">${header(c, id)}${links}<div class="mmst-cat">${esc(c, t.t('app_launch_other_defaults_title'))}</div>
        <div class="mmsx-defaults"><p>${esc(c, t.t('auto_launch_disable_text'))}</p><button type="button" class="mmsx-btn" disabled>${esc(c, t.t('clear_activities'))}</button></div></div>`;
    },
    action(c, name, el, cur) {
      const t = T(), id = cur.screen.split(':')[1], s = S(c);
      if (name === 'mmsx-linkstate') {
        const st = linkState(c, id);
        c.dialog({title: t.t('app_launch_open_domain_urls_title'), items: LINK.map((k, i) => ({html: `<span class="mmst-choice"><i class="mmw-radio${i === st ? ' on' : ''}"></i><span>${esc(c, t.t(k))}</span></span>`})), onItem: i => { s.appLinks = {...(s.appLinks || {}), [id]: i}; c.save(); c.render(); }});
        return true;
      }
      if (name === 'mmsx-domains') { c.dialog({title: t.t('app_launch_supported_domain_urls_title'), html: `<div class="mmsx-domainlist">${(MM.appDomains[id] || []).map(h => `<div>${esc(c, h)}</div>`).join('')}</div>`, buttons: [{label: t.t('dlg_ok')}]}); return true; }
      return false;
    }
  };

  // -- Data usage of one app -----------------------------------------------------------------------------------------
  MM.settingsScreens['data-app'] = {
    title: () => T().t('data_usage_app_summary_title'),
    render(c, cur) {
      const t = T(), id = cur.screen.split(':')[1], bytes = MM.appDataUsage?.(c, id) || 0, restricted = (S(c).restrictApps || []).includes(id);
      const fg = Math.round(bytes * 0.82), bg = bytes - fg;
      return `<div class="mmst-list">${header(c, id)}${MM.appsData[id] ? button(c, 'mmsx-appsettings', t.t('data_usage_app_settings')) : ''}${MM.dataUsageChart ? MM.dataUsageChart(c, bytes) : ''}
        ${pair(c, t.t('data_usage_label_foreground'), MM.fileSize(c, fg))}${pair(c, t.t('data_usage_label_background'), MM.fileSize(c, bg))}
        <button type="button" class="mmst-pref" data-action="mmsx-restrict"><span class="mmst-texts"><span class="mmst-title">${esc(c, t.t('data_usage_app_restrict_background'))}</span><span class="mmst-summary">${esc(c, t.t('data_usage_app_restrict_background_summary'))}</span></span><span class="mmst-widget"><i class="mmst-check${restricted ? ' on' : ''}"></i></span></button></div>`;
    },
    action(c, name, el, cur) {
      const t = T(), id = cur.screen.split(':')[1], s = S(c);
      if (name === 'mmsx-appsettings') { MM.settingsGo(c, `app:${id}`, t.t('application_info_label')); return true; }
      if (name === 'mmsx-restrict') {
        const on = (s.restrictApps || []).includes(id), set = v => { s.restrictApps = (s.restrictApps || []).filter(x => x !== id); if (v) s.restrictApps.push(id); c.save(); c.render(); };
        if (on) set(false);
        else c.dialog({title: t.t('data_usage_app_restrict_dialog_title'), message: t.t('data_usage_app_restrict_dialog'), buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: () => set(true)}]});
        return true;
      }
      return false;
    }
  };
})();
