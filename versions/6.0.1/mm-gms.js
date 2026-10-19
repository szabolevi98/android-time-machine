/* Android 6.0.1: the pages Google Settings (Google Play services 8.1, mm-google.js) opens, the screen 'gms-page' with
   the page as its sub. They keep Google Settings' look (common.Theme.GoogleSettings: the #263238 toolbar, rows 16 sp,
   category titles in #009688) and the image's own texts.
   - Sign-in & security, Personal info & privacy, Account preferences (accountsettings_*): the account's pages, each row
     opening its myaccount.google.com page in Chrome (the simulator's offline web, mm-web.js); Help in the overflow.
   - Ads (AdsSettingsActivity, ads_prefs_*): Reset advertising ID (with its confirmation), Opt out of interest-based ads,
     Ads by Google, and the advertising ID (a random UUID the reset replaces) at the foot.
   - Connected apps (plus_app_settings_activity_label): plus_list_apps_empty_message for the new account.
   - Google Fit (fitness_settings_*): Connected apps and Connected devices, both empty; the overflow's Delete history (its
     confirmation) and Help & feedback.
   - Nearby: the switch bar, nearby_overall_disabled_settings_text while off, Nearby apps (nearby_apps_summary) once on.
   - Play Games: Play Games 3.2's GamesSettingsFragment (its own games_gcore_* texts): Game Profile (Public), the
     multiplayer, quests and requests notification switches, Level up notifications, "Allow priority notifications
     from", "Learn about game notifications", Muted games (empty) and About with the app's version.
   - Data management: common_google_settings_drive_network_usage between Over Wi-Fi only and Over Wi-Fi or Cellular.
   - Security (security_settings_activity_title): Android Device Manager's Remotely locate this device and Allow remote
     lock and erase, Verify apps' Scan device for security threats.
   Location opens Settings › Location and Search & Now the Google app's settings (mm-google.js). */
(() => {
  'use strict';
  const T = () => MM.text('gms'), G = () => MM.text('playgames');
  const st = c => c.data.gms || (c.data.gms = {adid: uuid(), ads: false, nearby: false, data: 'wifi', locate: true, wipe: false, verify: true, games: {multi: true, quests: true, requests: true, level: true, public: true, scope: 'only_you'}});
  function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => { const r = Math.random() * 16 | 0; return (ch === 'x' ? r : (r & 3 | 8)).toString(16); }); }
  const esc = (c, s) => c.safe(s);
  const row = (c, key, title, summary = '', widget = '') => `<button type="button" class="mmst-pref" data-action="mmgp-row" data-k="${key}"><span class="mmst-texts"><span class="mmst-title">${esc(c, title)}</span>${summary ? `<span class="mmst-summary">${esc(c, summary)}</span>` : ''}</span>${widget ? `<span class="mmst-widget">${widget}</span>` : ''}</button>`;
  const sw = on => `<i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i>`;
  const cat = (c, title) => `<div class="mmgs-cat">${esc(c, title)}</div>`;
  const ACCOUNT = {
    security: ['accountsettings_security_settings_title', [['sign_in', 'accountsettings_security_settings_sign_in_title'], ['devices', 'accountsettings_security_settings_devices_title'], ['apps', 'accountsettings_security_settings_apps_title']]],
    privacy: ['accountsettings_privacy_settings_title', [['personal', 'accountsettings_privacy_settings_personal_info_title'], ['history', 'accountsettings_privacy_settings_history_title'], ['ads', 'accountsettings_privacy_settings_ads_title'], ['data', 'accountsettings_privacy_settings_data_title'], ['overview', 'accountsettings_privacy_settings_overview_title']]],
    preferences: ['accountsettings_preferences_settings_title', [['language', 'accountsettings_preferences_settings_language_title'], ['storage', 'accountsettings_preferences_settings_storage_title'], ['delete', 'accountsettings_preferences_settings_delete_account_title']]]
  };
  const TITLES = {ads: 'common_ads_settings_title', apps: 'common_connected_apps_settings_title', fit: 'common_fitness_settings_title', nearby: 'common_nearby_settings_title', data: 'common_google_settings_data_management_title', gsecurity: 'security_settings_activity_title'};
  const MENUS = {security: 'accountsettings_help', privacy: 'accountsettings_help', preferences: 'accountsettings_help', ads: 'ads_prefs_help_and_feedback', nearby: 'nearby_settings_help_and_feedback', gsecurity: 'security_help'};
  function body(c, page) {
    const t = T(), s = st(c);
    if (ACCOUNT[page]) return ACCOUNT[page][1].map(([k, key]) => row(c, `web:${page}/${k}`, t.t(key))).join('');
    if (page === 'ads') return row(c, 'resetadid', t.t('ads_prefs_reset_adid')) + row(c, 'ads', t.t('ads_prefs_interest_based_ads'), t.t('ads_prefs_interest_based_ads_summary'), `<i class="mmst-check${s.ads ? ' on' : ''}"></i>`)
      + row(c, 'web:ads/google', t.t('ads_prefs_ads_by_google')) + `<div class="mmgp-foot">${esc(c, t.t('ads_prefs_your_adid'))}<br>${esc(c, s.adid)}</div>`;
    if (page === 'apps') return `<div class="mmgp-empty">${esc(c, t.t('plus_list_apps_empty_message'))}</div>`;
    if (page === 'fit') return cat(c, t.t('fitness_settings_connected_apps_title')) + `<div class="mmgp-note">${esc(c, t.t('fitness_settings_connected_apps_title_empty'))}</div>` + cat(c, t.t('fitness_settings_connected_devices_title')) + `<div class="mmgp-note">${esc(c, t.t('fitness_settings_connected_devices_title_empty'))}</div>`;
    if (page === 'nearby') return `<button type="button" class="mmst-switchbar" data-action="mmgp-row" data-k="nearby"><span>${esc(c, MM.text('settings').t(s.nearby ? 'switch_on_text' : 'switch_off_text'))}</span>${sw(s.nearby)}</button>`
      + (s.nearby ? row(c, 'nearbyapps', t.t('nearby_apps'), AndroidStrings.format(t.t('nearby_apps_summary'), 0, 0)) : `<div class="mmgp-empty">${esc(c, t.t('nearby_overall_disabled_settings_text'))}</div>`);
    if (page === 'data') return row(c, 'data', t.t('common_google_settings_drive_network_usage'), t.t(s.data === 'all' ? 'common_settings_drive_network_usage_all' : 'common_settings_drive_network_usage_wifi'));
    if (page === 'gsecurity') return cat(c, t.t('common_mdm_feature_name')) + row(c, 'locate', t.t('mdm_settings_locate_title'), t.t(c.data.settings.location === false ? 'mdm_settings_system_locate_disabled_summary' : 'mdm_settings_locate_summary'), sw(s.locate && c.data.settings.location !== false))
      + row(c, 'wipe', t.t('mdm_settings_wipe_title'), t.t('mdm_settings_wipe_summary'), sw(s.wipe)) + cat(c, t.t('verify_apps_section_title')) + row(c, 'verify', t.t('verify_apps_title'), t.t('verify_apps_summary'), sw(s.verify));
    if (page === 'games') {
      const g = G(), n = s.games;
      // PublicProfileListItem: Public in games_public_profile_public_visibility_text, Hidden in _hidden_visibility_text.
      const pub = n.public !== false;
      return row(c, 'profile', g.t('games_gcore_public_profile'), '').replace('</span></span>', `</span><span class="mmst-summary" style="color:${pub ? '#0a7e07' : '#990000'}">${esc(c, g.t(pub ? 'games_gcore_public_profile_public_status' : 'games_gcore_public_profile_hidden_status'))}</span></span>`)
        + row(c, 'g:multi', g.t('games_gcore_multiplayer_notifications'), g.t('games_gcore_multiplayer_notifications_summary'), sw(n.multi))
        + row(c, 'g:quests', g.t('games_gcore_quest_notifications'), g.t('games_gcore_quest_notifications_summary'), sw(n.quests))
        + row(c, 'g:requests', g.t('games_gcore_request_notifications'), g.t('games_gcore_request_notifications_summary'), sw(n.requests))
        + row(c, 'g:level', g.t('games_gcore_level_notifications'), g.t('games_gcore_level_notifications_summary'), sw(n.level))
        + row(c, 'scope', g.t('games_gcore_notification_scope'), g.t(`common_chips_label_${n.scope || 'only_you'}`))
        + row(c, 'web:games/notifications', g.t('games_gcore_learn_more_notifications'))
        + cat(c, g.t('games_gcore_muted_games')) + `<div class="mmgp-note">${esc(c, g.t('games_gcore_muted_games_empty'))}</div>`
        + cat(c, g.t('games_gcore_about')) + `<div class="mmgp-note">${esc(c, AndroidStrings.format(g.t('games_gcore_build_version_title'), g.t('common_games_settings_title')))}<br>3.2.08 (2240318-030)</div>`;
    }
    return '';
  }
  function title(c, page) {
    if (ACCOUNT[page]) return T().t(ACCOUNT[page][0]);
    if (page === 'games') return G().t('games_settings_title');
    return T().t(TITLES[page] || 'common_google_settings');
  }
  const URLS = {security: 'security', privacy: 'privacy', preferences: 'preferences', ads: 'ads', games: 'games'};
  MM.register('gms-page', {
    statusColor: () => '#21272b',
    page: c => MM.page('gms', c.ui.sub),
    render(c) {
      const page = c.ui.sub || '', menu = MENUS[page] || (page === 'fit' ? 'fit' : '');
      return `<div class="mmgs mmgx mmgp"><div class="mmgs-bar"><button type="button" class="mmgs-up" data-action="mmgp-up"><img src="assets/gms-abc_ic_ab_back_mtrl_am_alpha.png" alt=""></button><span>${esc(c, title(c, page))}</span>${menu ? '<button type="button" class="mm-overflow" data-action="mmgp-menu"><img src="assets/fw-ic_menu_moreoverflow_material.svg" alt=""></button>' : ''}</div>
        <div class="mmgs-list">${body(c, page)}</div></div>`;
    },
    action(name, el, event, c) {
      const t = T(), s = st(c), page = c.ui.sub || '';
      if (name === 'mmgp-up') { c.back(); return true; }
      if (name === 'mmgp-menu') {
        const help = {label: t.t(MENUS[page] || 'fitness_settings_menu_help_feedback'), action: c => c.open('help', 'settings')};
        c.menu(page === 'fit' ? [{label: t.t('fitness_settings_menu_delete_history'), action: c => c.dialog({title: t.t('fitness_settings_confirm_delete_dialog'), message: t.t('fitness_settings_confirm_delete_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('fitness_settings_confirm_delete_button')}]})}, help] : [help]);
        return true;
      }
      if (name !== 'mmgp-row') return false;
      const k = el.dataset.k;
      if (k.startsWith('web:')) { const [sec, item] = k.slice(4).split('/'); c.open('chrome', `url:https://myaccount.google.com/${URLS[sec] || sec}${item ? `#${item}` : ''}`); return true; }
      if (k === 'resetadid') { c.dialog({title: t.t('ads_prefs_reset_adid_dialog_title'), message: t.t('ads_prefs_reset_adid_dialog_msg'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { s.adid = uuid(); c.save(); c.render(); }}]}); return true; }
      if (k === 'data') {
        const opts = [['wifi', 'common_settings_drive_network_usage_wifi'], ['all', 'common_settings_drive_network_usage_all']];
        c.dialog({title: t.t('common_google_settings_drive_network_usage'), items: opts.map(([v, key]) => ({html: `<span class="mmst-choice"><i class="mmw-radio${s.data === v ? ' on' : ''}"></i><span>${esc(c, t.t(key))}</span></span>`})), buttons: [{label: t.t('framework/cancel')}], onItem: i => { s.data = opts[i][0]; c.save(); c.render(); }});
        return true;
      }
      // ProfileVisibilityDialogFragment: the state in its colour, Make public / Stay hidden or Hide / Stay public.
      if (k === 'profile') {
        const g = G(), pub = s.games.public !== false;
        c.dialog({title: g.t('games_profile_visibility_dialog_title'), html: `<div class="mmgp-vis"><p>${esc(c, g.t('games_profile_visibility_dialog_content'))}</p><p class="mmgp-visstate" style="color:${pub ? '#0a7e07' : '#990000'}">${esc(c, g.t(pub ? 'games_profile_status_message_public' : 'games_profile_status_message_hidden'))}</p></div>`,
          buttons: [{label: g.t(pub ? 'games_profile_button_remain_public' : 'games_profile_button_remain_hidden')}, {label: g.t(pub ? 'games_profile_button_hide_profile' : 'games_profile_button_go_public'), action: c => { s.games.public = !pub; c.save(); c.render(); }}]});
        return true;
      }
      // The notification scope's ACL editor (CHOOSE_ACL): who may send priority notifications, as audience chips.
      if (k === 'scope') {
        const g = G(), opts = ['your_circles', 'extended_circles', 'public', 'only_you'];
        c.dialog({title: g.t('games_gcore_notification_scope'), items: opts.map(o => ({html: `<span class="mmst-choice"><i class="mmw-radio${(s.games.scope || 'only_you') === o ? ' on' : ''}"></i><span>${esc(c, g.t(`common_chips_label_${o}`))}</span></span>`})),
          buttons: [{label: t.t('framework/cancel')}], onItem: i => { s.games.scope = opts[i]; c.save(); c.render(); }});
        return true;
      }
      if (k.startsWith('g:')) { s.games[k.slice(2)] = !s.games[k.slice(2)]; c.save(); c.render(); return true; }
      if (k === 'locate' && c.data.settings.location === false) return true;
      if (['ads', 'nearby', 'locate', 'wipe', 'verify'].includes(k)) { s[k] = !s[k]; c.save(); c.render(); return true; }
      return true;
    }
  });
})();
