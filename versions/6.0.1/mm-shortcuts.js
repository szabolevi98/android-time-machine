/* Android 6.0.1: what a widget or shortcut from the widgets list asks for before it lands on the home screen
   (Launcher3's startActivityForResult of the provider's configure activity or the shortcut's CREATE_SHORTCUT
   activity); the launcher places the result where it was dropped (MM.widgets.configure, mm-launcher.js), and Back
   leaves nothing behind.
   - 'pick-list': the list those activities show, in the asking app's colours (its toolbar and status bar): Contacts'
     ContactSelectionActivity (shortcutActivityTitle / callShortcutActivityTitle / messageShortcutActivityTitle: the
     contacts with their tiles; the dial and message shortcuts take the contact's number), Chrome's bookmark shortcut
     (bookmark_shortcut_choose_bookmark), Drive's create_shortcut_title (its files), Gmail's label shortcut
     (activity_folder_selection, then shortcut_name_title to name it), Play Music's choose_playlist (the auto playlists
     Thumbs up, Last added, Free and purchased) and Settings' CreateShortcut (settings_shortcut: the activities with the
     com.android.settings.SHORTCUT category, under the Settings icon).
   - 'maps-shortcut': Maps' directions widget (DIRECTIONS_WIDGET_TITLE): the destination, the travel mode, Start
     turn-by-turn navigation, the shortcut's name and Save.
   - Play Store's widget (MarketWidgetTrampolineActivity → WidgetConfigurationActivity "Google Play"): a three column
     grid of the corpora with their ic_launcher_play_* icons.
   - Drive's scan shortcut needs nothing and is placed as it is. Messenger's conversation widget picks its
     conversation in Messenger (mm-messenger.js). */
(() => {
  'use strict';
  const T = () => MM.text('widgets');
  const esc = (c, s) => c.safe(s);
  MM.widgetConfigs = MM.widgetConfigs || {};
  const P = () => MM.people;

  // A list activity; rows: {icon (html), title, sub, value}.
  function list(c, spec) { c.ui.pickList = spec; c.open('pick-list'); }
  MM.register('pick-list', {
    app: false,
    statusColor: c => c.ui.pickList?.status || '#000',
    render(c) {
      const s = c.ui.pickList; if (!s) return '<div class="mmpk"></div>';
      const rows = s.rows.map((r, i) => `<button type="button" class="mmpk-row" data-action="mmpk-pick" data-i="${i}">${r.icon || ''}<span><b>${esc(c, r.title)}</b>${r.sub ? `<small>${esc(c, r.sub)}</small>` : ''}</span></button>`).join('');
      const grid = s.grid ? `<div class="mmpk-grid">${s.rows.map((r, i) => `<button type="button" class="mmpk-cell" data-action="mmpk-pick" data-i="${i}">${r.icon}<span>${esc(c, r.title)}</span></button>`).join('')}</div>` : '';
      return `<div class="mmpk${s.dark ? ' dark' : ''}"><div class="mmpk-bar" style="background:${s.color}"><button type="button" class="mmpk-btn" data-action="mmpk-back"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button><span>${esc(c, s.title)}</span></div>
        <div class="mmpk-page">${grid || rows || `<div class="mmpk-empty">${esc(c, s.empty || '')}</div>`}</div></div>`;
    },
    back(c) { c.ui.pickList = null; return false; },
    action(name, el, event, c) {
      if (name === 'mmpk-back') { c.back(); return true; }
      if (name !== 'mmpk-pick') return false;
      const s = c.ui.pickList, row = s.rows[+el.dataset.i];
      c.back(); s.onPick(c, row);
      return true;
    }
  });

  const contactRows = c => P().sorted(c).map(p => ({icon: P().tile(c, p, 'mmpk-tile'), title: p.name, sub: p.phone ? `${P().typeLabel()} ${P().format(p.phone)}` : '', value: p}));
  const contactConfig = (kind, titleKey) => (c, done) => list(c, {title: T().t(titleKey), color: '#0288d1', status: '#0277bd', rows: contactRows(c), onPick: (c, r) => {
    const p = r.value;
    done({type: 'shortcut', label: p.name, person: p.id, badge: kind,
      open: kind === 'contact' ? {view: 'contacts', sub: `contact:${p.id}`} : kind === 'dial' ? {call: p.phone} : {view: 'messenger', sub: `to:${p.phone}`}});
  }});
  MM.widgetConfigs['sc-contact'] = contactConfig('contact', 'GoogleContacts/shortcutActivityTitle');
  MM.widgetConfigs['sc-dial'] = contactConfig('dial', 'GoogleContacts/callShortcutActivityTitle');
  MM.widgetConfigs['sc-message'] = contactConfig('message', 'GoogleContacts/messageShortcutActivityTitle');

  MM.widgetConfigs['sc-bookmark'] = (c, done) => {
    const pages = (MM.chromeBookmarks?.(c) || []).map(url => MM.web?.page(url) || {url, title: url});
    list(c, {title: T().t('Chrome/bookmark_shortcut_choose_bookmark'), color: '#f2f2f2', status: '#000', dark: true, rows: pages.map(p => ({icon: '<img class="mmpk-ic" src="assets/wg-sc-bookmark.png" alt="">', title: p.title || p.url, sub: p.url, value: p})),
      onPick: (c, r) => done({type: 'shortcut', label: r.value.title || r.value.url, icon: 'assets/wg-sc-bookmark.png', open: {view: 'chrome', sub: `url:${r.value.url}`}})});
  };
  MM.widgetConfigs['sc-drive'] = (c, done) => {
    const ICON = {folder: 'ic_type_folder', sheet: 'ic_type_sheet', slide: 'ic_type_presentation', file: 'ic_type_file', image: 'ic_type_image', pdf: 'ic_type_pdf', doc: 'ic_type_doc'};
    const files = (c.data.driveFiles || []).filter(f => !f.trashed);
    list(c, {title: T().t('Drive/create_shortcut_title'), color: '#e0e0e0', status: '#bdbdbd', dark: true, empty: T().t('Drive/empty_doclist_for_my_drive_view'),
      rows: files.map(f => ({icon: `<img class="mmpk-ic" src="assets/dr-${ICON[f.type] || 'ic_type_doc'}.png" alt="">`, title: f.name, value: f})),
      onPick: (c, r) => done({type: 'shortcut', label: r.value.name, icon: 'assets/wg-sc-drive.png', open: {view: 'drive'}})});
  };
  MM.widgetConfigs['sc-drivescan'] = (c, done) => done({type: 'shortcut', label: T().t('Drive/widget_scan_to_drive'), icon: 'assets/wg-sc-drivescan.png', open: {view: 'drive', sub: 'scan'}});
  MM.widgetConfigs['sc-gmaillabel'] = (c, done) => list(c, {title: T().t('PrebuiltGmail/activity_folder_selection'), color: '#da4336', status: '#b93221',
    rows: (MM.gmailFolders?.(c) || []).map(f => ({icon: `<img class="mmpk-ic" src="${f.icon}" alt="">`, title: f.name, value: f})),
    onPick: (c, r) => {
      let name = r.value.name;
      c.dialog({title: T().t('PrebuiltGmail/shortcut_name_title'), html: `<div class="mmst-edit"><input type="text" class="mmst-input mmpk-name" value="${esc(c, name)}" spellcheck="false"></div>`,
        mount(c, win) { const i = win.querySelector('.mmpk-name'); i.addEventListener('input', () => { name = i.value.trim(); }); setTimeout(() => { i.focus(); i.select(); }, 50); },
        buttons: [{label: T().t('framework/cancel')}, {label: T().t('framework/ok'), action: () => done({type: 'shortcut', label: name || r.value.name, icon: 'assets/wg-sc-gmaillabel.png', open: {view: 'gmail', sub: `folder:${r.value.id}`}})}]});
    }});
  MM.widgetConfigs['sc-playlist'] = (c, done) => list(c, {title: T().t('Music2/choose_playlist'), color: '#ef6c00', status: '#e65100',
    rows: ['Music2/thumbsup_list', 'Music2/recentlyadded', 'Music2/storemusic_list'].map(k => ({icon: '<img class="mmpk-ic" src="assets/wg-sc-playlist.png" alt="">', title: T().t(k), value: k})),
    onPick: (c, r) => done({type: 'shortcut', label: T().t(r.value), icon: 'assets/wg-sc-playlist.png', open: {view: 'play-music'}})});
  // Settings' activities with com.android.settings.SHORTCUT, in the manifest's order, and the screens they open here.
  const SETTINGS = [['wifi_settings', 'wifi'], ['bluetooth_settings_title', 'bluetooth'], ['tether_settings_title_all', 'xml:tether_prefs'], ['vpn_settings_title', 'xml:vpn_settings2'],
    ['zen_mode_settings_title', 'xml:zen_mode_settings'], ['zen_mode_priority_settings_title', 'xml:zen_mode_priority_settings'], ['zen_mode_automation_settings_title', 'xml:zen_mode_automation_settings'],
    ['display_settings', 'xml:display_settings'], ['applications_settings', 'apps'], ['memory_settings_title', 'memory'], ['notification_log_title', 'notification-log'],
    ['location_settings_title', 'xml:location_settings'], ['trusted_credentials', 'credentials'], ['accessibility_settings', 'xml:accessibility_settings'], ['power_usage_summary_title', 'battery'],
    ['battery_saver', 'xml:battery_saver_settings'], ['data_usage_summary_title', 'data-usage'], ['screensaver_settings_title', 'dream'], ['notification_settings', 'xml:notification_settings']];
  MM.widgetConfigs['sc-settings'] = (c, done) => {
    const icon = MM.appsData.settings?.icon;
    list(c, {title: T().t('Settings/settings_shortcut'), color: '#263238', status: '#21272b', rows: SETTINGS.map(([k, screen]) => ({icon: `<img class="mmpk-ic big" src="${icon}" alt="">`, title: T().t(`Settings/${k}`), value: screen})),
      onPick: (c, r) => done({type: 'shortcut', label: r.title, icon, open: {view: 'settings', sub: r.value}})});
  };
  // Play Store's widget: the corpus it shows.
  const CORPORA = [['apps', 'corpus_title_apps'], ['books', 'corpus_title_books'], ['movietv', 'corpus_title_movies'], ['music', 'corpus_title_music'], ['newsstand', 'corpus_title_newsstand']];
  MM.widgetConfigs.market = (c, done) => list(c, {title: T().t('Phonesky/app_name'), color: '#689f38', status: '#558b2f', grid: true,
    rows: CORPORA.map(([k, s]) => ({icon: `<img src="assets/ps-ic_launcher_play_${k}.png" alt="">`, title: T().t(`Phonesky/${s}`), value: k})),
    onPick: (c, r) => done({corpus: r.value})});

  // Maps' directions shortcut.
  const MODES = [['drive', 'ACCESSIBILITY_SWITCH_TO_DRIVING', 'ic_qu_drive'], ['transit', 'ACCESSIBILITY_SWITCH_TO_TRANSIT', 'ic_qu_transit'], ['walk', 'ACCESSIBILITY_SWITCH_TO_WALKING', 'ic_qu_walking'], ['bike', 'ACCESSIBILITY_SWITCH_TO_BICYCLING', 'ic_qu_biking']];
  MM.widgetConfigs['sc-directions'] = (c, done) => { c.ui.mapsShortcut = {dest: '', name: '', mode: 'drive', nav: false, done}; c.open('maps-shortcut'); };
  MM.register('maps-shortcut', {
    app: false,
    statusColor: () => '#3367d6',
    render(c) {
      const t = T(), s = c.ui.mapsShortcut || {};
      const modes = MODES.map(([k, label]) => `<button type="button" class="${s.mode === k ? 'on' : ''}" data-action="mmpk-mode" data-mode="${k}">${esc(c, t.t(`Maps/${label}`))}</button>`).join('');
      return `<div class="mmpk"><div class="mmpk-bar" style="background:#4285f4"><button type="button" class="mmpk-btn" data-action="mmpk-back"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button><span>${esc(c, t.t('Maps/DIRECTIONS_WIDGET_TITLE'))}</span></div>
        <div class="mmpk-page mmpk-form"><input class="mmpk-in" data-f="dest" value="${esc(c, s.dest)}" placeholder="${esc(c, t.t('Maps/DIRECTIONS_CHOOSE_END_POINT'))}" autocomplete="off">
        <div class="mmpk-modes">${modes}</div>
        <button type="button" class="mmpk-check" data-action="mmpk-nav"><i class="mmst-check${s.nav ? ' on' : ''}"></i><span>${esc(c, t.t('Maps/DIRECTIONS_WIDGET_NAVIGATION_CHECKBOX'))}</span></button>
        <label class="mmpk-label">${esc(c, t.t('Maps/DIRECTIONS_WIDGET_SHORTCUT_NAME'))}<input class="mmpk-in" data-f="name" value="${esc(c, s.name)}" autocomplete="off"></label></div>
        <div class="mmpk-foot"><button type="button" data-action="mmpk-save"${s.dest.trim() ? '' : ' disabled'}>${esc(c, t.t('Maps/DIRECTIONS_WIDGET_SAVE'))}</button></div></div>`;
    },
    mount(c, root) {
      const s = c.ui.mapsShortcut; if (!s) return;
      root.querySelectorAll('.mmpk-in').forEach(i => i.addEventListener('input', () => { s[i.dataset.f] = i.value; const b = root.querySelector('[data-action=mmpk-save]'); if (b) b.disabled = !s.dest.trim(); }));
    },
    back(c) { c.ui.mapsShortcut = null; return false; },
    action(name, el, event, c) {
      const s = c.ui.mapsShortcut;
      if (name === 'mmpk-back') { c.back(); return true; }
      if (name === 'mmpk-mode') { s.mode = el.dataset.mode; c.render(); return true; }
      if (name === 'mmpk-nav') { s.nav = !s.nav; c.render(); return true; }
      if (name === 'mmpk-save') {
        const dest = s.dest.trim(); if (!dest) return true;
        const done = s.done; c.back();
        done({type: 'shortcut', label: s.name.trim() || dest, icon: MM.appsData.maps?.icon, open: {view: 'maps', sub: `dir:${s.mode}:${s.nav ? 1 : 0}:${dest}`}});
        return true;
      }
      return false;
    }
  });

  // A placed shortcut's tap.
  MM.openShortcut = (c, it) => { if (it.open?.call) MM.phone?.call(c, it.open.call); else if (it.open?.view) c.open(it.open.view, it.open.sub || ''); };
})();
