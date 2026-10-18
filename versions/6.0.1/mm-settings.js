/* Android 6.0.1 Settings (Settings.apk, MTC20K), the screen 'settings'.
   - SettingsActivity: Theme.Settings (colorPrimary #263238 under the action bar, colorPrimaryDark #21272b behind the
     status bar, colorAccent #009688, window #fafafa); the action bar 56 dp (actionbar_size) with the title (Material
     ActionBar Title, 20 sp sans-serif-medium, white), ic_ab_back_material as Up on a sub-screen (the title then 72 dp
     in, else actionbar_contentInsetStart 16 dp), and on the dashboard options_menu.xml's search item.
   - The dashboard (DashboardSummary): dashboard_categories.xml, each category a dashboard_category.xml card (white,
     elevation 4 dp, 8 dp under it) with its title (TextAppearance.CategoryTitle: Body2 14 sp medium in the accent, 48 dp
     high, 16 dp in) and dashboard_tile.xml rows (72 dp, the 24 dp icon 16 dp in and 32 dp before the 16 sp title, a
     1 dp divider between tiles); SettingsActivity.updateTilesList removes the SIM tile (one SIM slot), the operator and
     manufacturer tiles (no such app), Home (one home app) and Developer options until they are turned on; the external
     tile of GMS Core (GoogleSettingsLink, category personal) comes after Accounts.
   - A preference screen: the image's res/xml (mm-settings-data.js) through PreferenceFragment, every row
     preference_material_settings.xml (48 dp at least, 16 dp at the sides, the icon frame 60 dp wide with 12 dp after it,
     the 16 sp title over the 14 sp summary in textColorSecondary, 16 dp padding above and below, the widget frame 16 dp
     after the texts), a category preference_category_material.xml (Body2 in the accent, 16 dp above and below);
     SwitchPreference / CheckBoxPreference keep their value, a ListPreference opens a single choice dialog and shows its
     entry as the summary where the summary says %s, an EditTextPreference a text dialog.
   - Screens with code of their own (Wi-Fi, Bluetooth, Apps …) register in MM.settingsScreens ({title, render, bar (above
     the scrolling list: a switch bar), actions (action bar buttons), mount, action, back}); a fragment no screen
     draws shows the not-built-yet card in the content area. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const str = ref => typeof ref === 'string' && ref.startsWith('string/') ? T().t(ref.slice(7)) : ref || '';
  const arr = ref => typeof ref === 'string' && ref.startsWith('array/') ? T().t(ref.slice(6)) : ref || [];
  const X = () => MM.settingsXml;
  MM.settingsScreens = MM.settingsScreens || {};
  MM.settingsHooks = MM.settingsHooks || {};
  MM.settingsStr = str; MM.settingsArr = arr;
  Object.assign(MM.defaults.settings, {prefs: {}});

  // The fragment of a tile or preference, and the screen that draws it.
  const FRAGMENTS = {
    'com.android.settings.wifi.WifiSettings': 'wifi', 'com.android.settings.bluetooth.BluetoothSettings': 'bluetooth',
    'com.android.settings.DataUsageSummary': 'data-usage', 'com.android.settings.WirelessSettings': 'xml:wireless_settings',
    'com.android.settings.DisplaySettings': 'xml:display_settings', 'com.android.settings.notification.NotificationSettings': 'xml:notification_settings',
    'com.android.settings.applications.ManageApplications': 'apps', 'com.android.settings.deviceinfo.StorageSettings': 'storage',
    'com.android.settings.fuelgauge.PowerUsageSummary': 'battery', 'com.android.settings.applications.ProcessStatsSummary': 'memory',
    'com.android.settings.users.UserSettings': 'xml:user_settings', 'com.android.settings.nfc.PaymentSettings': 'nfc-payment',
    'com.android.settings.location.LocationSettings': 'xml:location_settings', 'com.android.settings.SecuritySettings': 'xml:security',
    'com.android.settings.accounts.AccountSettings': 'accounts', 'com.android.settings.inputmethod.InputMethodAndLanguageSettings': 'xml:language_settings',
    'com.android.settings.PrivacySettings': 'xml:privacy_settings', 'com.android.settings.DateTimeSettings': 'xml:date_time_prefs',
    'com.android.settings.accessibility.AccessibilitySettings': 'xml:accessibility_settings', 'com.android.settings.print.PrintSettingsFragment': 'xml:print_settings',
    'com.android.settings.DevelopmentSettings': 'xml:development_prefs', 'com.android.settings.DeviceInfoSettings': 'xml:device_info_settings',
    'com.android.settings.DreamSettings': 'dream', 'com.android.settings.WallpaperTypeSettings': 'wallpaper-type'
  };
  // Other preference fragments of the image whose screen is a res/xml of the same name.
  const XML_FRAGMENTS = {
    'com.android.settings.notification.ZenModeSettings': 'zen_mode_settings', 'com.android.settings.notification.ZenModePrioritySettings': 'zen_mode_priority_settings',
    'com.android.settings.notification.OtherSoundSettings': 'other_sound_settings', 'com.android.settings.deviceinfo.Status': 'device_info_status',
    'com.android.settings.deviceinfo.SimStatus': 'device_info_sim_status', 'com.android.settings.LegalSettings': 'about_legal',
    'com.android.settings.WifiCallingSettings': 'wifi_calling_settings', 'com.android.settings.TetherSettings': 'tether_prefs',
    'com.android.settings.vpn2.VpnSettings': 'vpn_settings2', 'com.android.settings.wifi.AdvancedWifiSettings': 'wifi_advanced_settings',
    'com.android.settings.location.ScanningSettings': 'location_scanning', 'com.android.settings.location.LocationMode': 'location_mode',
    'com.android.settings.accessibility.CaptionPropertiesFragment': 'captioning_settings', 'com.android.settings.accessibility.ToggleDaltonizerPreferenceFragment': 'accessibility_daltonizer_settings',
    'com.android.settings.tts.TextToSpeechSettings': 'tts_settings', 'com.android.settings.applications.AdvancedAppSettings': 'advanced_apps',
    'com.android.settings.applications.ManageDefaultApps': 'default_apps', 'com.android.settings.ApnSettings': 'apn_settings',
    'com.android.settings.DateTimeSettings': 'date_time_prefs', 'com.android.settings.ScreenPinningSettings': 'screen_pinning_settings',
    'com.android.settings.TrustAgentSettings': 'trust_agent_settings', 'com.android.settings.fuelgauge.BatterySaverSettings': 'battery_saver_settings',
    'com.android.settings.UsageAccessSettings': 'usage_access_settings', 'com.android.settings.wfd.WifiDisplaySettings': 'wifi_display_settings',
    'com.android.settings.notification.AppNotificationSettings': 'app_notification_settings', 'com.android.settings.SecuritySettings': 'security_settings_misc',
    'com.android.settings.deviceinfo.ImeiInformation': 'device_info_phone_status',
    'com.android.settings.notification.ZenModeAutomationSettings': 'zen_mode_automation_settings'
  };
  // The screens other parts of the system open by a short name (Quick Settings' "More settings", the launcher's links).
  const ALIASES = {zen: 'xml:zen_mode_settings', 'zen-priority': 'xml:zen_mode_priority_settings', users: 'xml:user_settings',
    cast: 'xml:wifi_display_settings', display: 'xml:display_settings', sound: 'xml:notification_settings'};
  function screenOf(fragment) {
    if (!fragment) return null;
    if (FRAGMENTS[fragment]) return FRAGMENTS[fragment];
    if (XML_FRAGMENTS[fragment]) return `xml:${XML_FRAGMENTS[fragment]}`;
    return `missing:${fragment}`;
  }

  // The values preferences keep (data.settings.prefs), their defaults from the XML.
  const prefs = c => c.data.settings.prefs || (c.data.settings.prefs = {});
  // ListPreference and its subclasses in the image's XML (WarnedListPreference: the font size).
  const isList = n => n.t === 'ListPreference' || n.t === 'WarnedListPreference' || n.t === 'DropDownPreference';
  function value(c, node) {
    const hook = MM.settingsHooks[current(c)?.xml]?.get?.(c, node.key, node);
    if (hook !== undefined) return hook;
    const p = prefs(c);
    if (node.key in p) return p[node.key];
    if (node.t === 'SwitchPreference' || node.t === 'CheckBoxPreference') return String(node.defaultValue) === 'true';
    return node.defaultValue ?? null;
  }
  function setValue(c, node, v) {
    if (MM.settingsHooks[current(c)?.xml]?.set?.(c, node.key, v, node) === true) { c.save(); return; }
    prefs(c)[node.key] = v; c.save();
  }

  // Navigation inside Settings: a stack of {screen, title}; Back pops it, the last one leaves the app.
  const state = c => c.ui.settings || (c.ui.settings = {stack: []});
  // A screen "xml:<name>" is a res/xml file; "xml:<name>#<key>" one of its nested PreferenceScreens.
  const current = c => { const s = state(c).stack.at(-1); if (!s) return null; const ref = s.screen.startsWith('xml:') ? s.screen.slice(4) : null; return {...s, xml: ref ? ref.split('#')[0] : null, nested: ref?.split('#')[1] || null}; };
  const nodeOf = cur => cur.nested ? findKey(X()[cur.xml], cur.nested) : X()[cur.xml];
  function go(c, screen, title) { const st = state(c); st.stack.push({screen, title}); if (st.scroll) delete st.scroll[screen]; c.render(); }
  MM.settingsGo = go;

  // -- the dashboard ----------------------------------------------------------------------------------------------
  function dashboard(c) {
    const s = c.data.settings, hidden = new Set(['id/sim_settings', 'id/operator_settings', 'id/manufacturer_settings', 'id/home_settings']);
    if (!s.devOptions) hidden.add('id/development_settings');
    const icon = ic => ic?.icon ? (ic.tint ? `<i class="mmst-ic" style="background:${ic.tint};-webkit-mask-image:url('assets/${ic.icon}');mask-image:url('assets/${ic.icon}')"></i>` : `<img class="mmst-ic" src="assets/${ic.icon}" alt="">`) : '<i class="mmst-ic"></i>';
    const cards = X().dashboard_categories.c.map(cat => {
      const tiles = [];
      for (const t of cat.c || []) {
        if (t.t === 'external-tiles') {
          for (const e of MM.settingsExternal || []) if (cat.key === 'string/category_key_personal' && e.category === 'personal') tiles.push(`<button type="button" class="mmst-tile" data-action="mmst-external" data-pkg="${e.pkg}"><img class="mmst-ic" src="assets/${e.icon}" alt=""><span>${c.safe(T().t(e.title))}</span></button>`);
          continue;
        }
        if (hidden.has(t.id)) continue;
        tiles.push(`<button type="button" class="mmst-tile" data-action="mmst-go" data-screen="${screenOf(t.fragment)}" data-title="${c.safe(str(t.title))}">${icon(t.icon)}<span>${c.safe(str(t.title))}</span></button>`);
      }
      return `<div class="mmst-card"><div class="mmst-cardtitle">${c.safe(str(cat.title))}</div>${tiles.join('<i class="mmst-divider"></i>')}</div>`;
    }).join('');
    return `<div class="mmst-dash">${cards}</div>`;
  }

  // -- a preference screen from its XML ----------------------------------------------------------------------------
  function rows(c, node, xml) {
    const hook = MM.settingsHooks[xml] || {};
    const out = [];
    for (const n of node.c || []) {
      if (hook.hide?.(c, n.key, n) || (n.key && hook.hidden?.includes(n.key))) continue;
      if (n.t === 'PreferenceCategory') {
        const inner = rows(c, n, xml);
        if (!inner) continue;
        out.push(`${n.title ? `<div class="mmst-cat">${c.safe(hook.title?.(c, n.key, n) ?? str(n.title))}</div>` : ''}${inner}`);
        continue;
      }
      out.push(pref(c, n, xml));
    }
    return out.join('');
  }
  function summaryOf(c, n, xml) {
    const hook = MM.settingsHooks[xml]?.summary?.(c, n.key, n);
    if (hook !== undefined) return hook;
    const v = value(c, n);
    if (n.t === 'SwitchPreference' || n.t === 'CheckBoxPreference') {
      if (v && n.summaryOn) return str(n.summaryOn);
      if (!v && n.summaryOff) return str(n.summaryOff);
    }
    if (isList(n) && n.entries && n.entryValues) {
      const i = n.entryValues.indexOf(String(v)), entry = i >= 0 ? arr(n.entries)[i] : '';
      const sum = str(n.summary);
      return sum ? AndroidStrings.format(sum, entry) : n.t === 'DropDownPreference' ? entry : '';
    }
    if (n.t === 'EditTextPreference' && !n.summary) return v || '';
    return str(n.summary);
  }
  function pref(c, n, xml) {
    const hook = MM.settingsHooks[xml] || {};
    // A preference with a layout of its own (VolumeSeekBarPreference …) draws itself.
    const own = hook.row?.(c, n.key, n);
    if (own) return own;
    const title = hook.title?.(c, n.key, n) ?? str(n.title), summary = summaryOf(c, n, xml);
    const v = value(c, n), disabled = hook.disabled?.(c, n.key, n) || String(n.enabled) === 'false' || (n.dependency && dependentsOff(c, findKey(X()[xml], n.dependency)));
    let widget = '';
    if (n.t === 'SwitchPreference' || hook.switch?.includes(n.key)) widget = `<i class="mmw-switch${v ? ' on' : ''}"><i class="mmw-thumb"></i></i>`;
    if (n.t === 'CheckBoxPreference') widget = `<i class="mmst-check${v ? ' on' : ''}"></i>`;
    const ic = n.icon?.icon ? `<span class="mmst-iconframe">${n.icon.tint ? `<i class="mmst-ic" style="background:${n.icon.tint};-webkit-mask-image:url('assets/${n.icon.icon}');mask-image:url('assets/${n.icon.icon}')"></i>` : `<img class="mmst-ic" src="assets/${n.icon.icon}" alt="">`}</span>` : '';
    // A row not selectable (setSelectable(false)) is plain text; wifi_advance_layout draws its texts in the Small size.
    const tag = hook.selectable?.(c, n.key, n) === false ? 'div' : 'button', small = n.layout === 'layout/wifi_advance_layout' ? ' small' : '';
    return `<${tag} ${tag === 'button' ? 'type="button" ' : ''}class="mmst-pref${disabled ? ' disabled' : ''}${small}" data-action="mmst-pref" data-key="${c.safe(n.key || '')}" ${disabled ? 'disabled' : ''}>${ic}<span class="mmst-texts"><span class="mmst-title">${c.safe(title)}</span>${summary ? `<span class="mmst-summary">${c.safe(summary)}</span>` : ''}</span>${widget ? `<span class="mmst-widget">${widget}</span>` : ''}</${tag}>`;
  }
  // Preference.shouldDisableDependents: a two-state dependency disables its dependents when its value equals
  // disableDependentsState (false unless the XML says so).
  function dependentsOff(c, dep) {
    if (!dep) return false;
    const v = value(c, dep);
    return String(dep.disableDependentsState) === 'true' ? !!v : !v;
  }
  function findKey(node, key) {
    if (!node) return null;
    if (node.key === key) return node;
    for (const ch of node.c || []) { const f = findKey(ch, key); if (f) return f; }
    return null;
  }
  MM.settingsFind = findKey;

  // -- dialogs --------------------------------------------------------------------------------------------------------
  function listDialog(c, n, xml) {
    const entries = arr(n.entries), values = n.entryValues || [], cur = String(value(c, n));
    c.dialog({title: str(n.dialogTitle) || str(n.title), keepOpen: false,
      items: entries.map((e, i) => ({html: `<span class="mmst-choice"><i class="mmw-radio${values[i] === cur ? ' on' : ''}"></i><span>${c.safe(e)}</span></span>`})),
      buttons: [{label: T().t('framework/cancel') || 'Cancel'}],
      onItem: i => { setValue(c, n, values[i]); MM.settingsHooks[xml]?.changed?.(c, n.key, values[i], n); c.render(); }});
  }
  function textDialog(c, n, xml) {
    const v = value(c, n) || '';
    c.dialog({title: str(n.dialogTitle) || str(n.title), html: `<div class="mmst-edit"><input type="text" value="${c.safe(v)}" class="mmst-input"></div>`,
      buttons: [{label: T().t('framework/cancel') || 'Cancel'}, {label: T().t('framework/ok') || 'OK', action: c => { const val = c.el.overlay.querySelector('.mmst-input')?.value ?? v; setValue(c, n, val); MM.settingsHooks[xml]?.changed?.(c, n.key, val, n); c.render(); }}]});
    setTimeout(() => c.el.overlay.querySelector('.mmst-input')?.focus(), 50);
  }

  // -- the activity ---------------------------------------------------------------------------------------------------
  function render(c) {
    const st = state(c);
    if (c.ui.sub && c.ui.sub !== st.opened) { st.opened = c.ui.sub; st.stack = [{screen: ALIASES[c.ui.sub] || c.ui.sub, title: ''}]; }
    const cur = current(c);
    let title = T().t('settings_label_launcher'), body, bar = '';
    if (!cur) body = dashboard(c);
    else {
      // A screen with code of its own draws itself, or adds a bar / actions to its res/xml (Location's switch bar).
      const custom = MM.settingsScreens[cur.screen.split(':')[0]] || MM.settingsScreens[cur.screen];
      bar = custom?.bar?.(c, cur) || '';
      // A screen of its own activity without the action bar (Theme.FingerprintEnroll's SetupWizardLayout) draws it all.
      if (custom?.full) return `<div class="mmst mmst-full">${custom.render(c, cur)}</div>`;
      if (custom?.render) { title = custom.title?.(c, cur) || cur.title; body = custom.render(c, cur); }
      else if (cur.xml && X()[cur.xml]) { title = cur.title || str(nodeOf(cur).title) || title; body = `<div class="mmst-list">${cur.nested ? '' : MM.settingsHooks[cur.xml]?.top?.(c) || ''}${rows(c, nodeOf(cur), cur.xml)}</div>`; }
      else { title = cur.title || title; body = `<div class="mmst-missing">${c.missing('settings', `<small>${c.safe(cur.screen.replace(/^missing:/, ''))}</small>`)}</div>`; }
    }
    const up = !!cur;
    const actions = !cur ? `<button type="button" class="mmst-ab-btn" data-action="mmst-search" aria-label="${c.safe(T().t('search_menu'))}"><img src="assets/fw-ic_search_api_material.svg" alt=""></button>` : ((MM.settingsScreens[cur.screen.split(':')[0]] || MM.settingsScreens[cur.screen])?.actions?.(c, cur) || '');
    return `<div class="mmst"><div class="mmst-ab">${up ? `<button type="button" class="mmst-up" data-action="mmst-up" aria-label="Navigate up"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button>` : ''}<span class="mmst-abtitle${up ? ' up' : ''}">${c.safe(title)}</span>${actions}</div>${bar}
      <div class="mmst-content">${body}</div></div>`;
  }

  function mount(c, root) {
    const cur = current(c), st = state(c), key = cur?.screen || '', content = root.querySelector('.mmst-content');
    // A screen keeps its scroll position while it is in the stack (re-rendered or returned to).
    if (content) { content.scrollTop = st.scroll?.[key] || 0; content.addEventListener('scroll', () => { (st.scroll ||= {})[key] = content.scrollTop; }, {passive: true}); }
    const custom = cur && (MM.settingsScreens[cur.screen.split(':')[0]] || MM.settingsScreens[cur.screen]);
    custom?.mount?.(c, root, cur);
    if (cur?.xml) MM.settingsHooks[cur.xml]?.mount?.(c, root);
  }

  MM.register('settings', {
    title: 'Settings',
    statusColor: () => MM.settingsTheme?.colorPrimaryDark || '#21272b',
    render, mount,
    reset(c) { c.ui.settings = null; },
    back(c) {
      const st = state(c), cur = current(c);
      const custom = cur && (MM.settingsScreens[cur.screen.split(':')[0]] || MM.settingsScreens[cur.screen]);
      if (custom?.back?.(c, cur)) return true;
      if (st.stack.length > (st.opened ? 1 : 0)) { st.stack.pop(); c.render(); return true; }
      c.ui.settings = null; return false;
    },
    action(name, el, event, c) {
      const cur = current(c);
      const custom = cur && (MM.settingsScreens[cur.screen.split(':')[0]] || MM.settingsScreens[cur.screen]);
      if (custom?.action?.(c, name, el, cur)) return true;
      if (name === 'mmst-up') { if (!this.back(c)) c.back(); return true; }
      if (name === 'mmst-go') { go(c, el.dataset.screen, el.dataset.title); return true; }
      if (name === 'mmst-external') { c.open('google-settings'); return true; }
      if (name === 'mmst-search') { go(c, 'missing:com.android.settings.dashboard.SearchResultsSummary', T().t('search_menu')); return true; }
      if (name === 'mmst-pref' && cur?.xml) {
        const n = findKey(X()[cur.xml], el.dataset.key) || {};
        const hook = MM.settingsHooks[cur.xml] || {};
        if (hook.click?.(c, n.key, n) === true) return true;
        if (n.t === 'SwitchPreference' || n.t === 'CheckBoxPreference' || hook.switch?.includes(n.key)) { const v = !value(c, n); setValue(c, n, v); hook.changed?.(c, n.key, v, n); c.render(); return true; }
        if (isList(n)) { listDialog(c, n, cur.xml); return true; }
        if (n.t === 'EditTextPreference') { textDialog(c, n, cur.xml); return true; }
        if (n.fragment) { go(c, screenOf(n.fragment), str(n.title)); return true; }
        if (n.t === 'PreferenceScreen' && n.c && !n.fragment) { go(c, `xml:${cur.xml}#${n.key}`, str(n.title)); return true; }
        if (n.intent) { go(c, screenOf(n.intent.targetClass) && !screenOf(n.intent.targetClass).startsWith('missing:') ? screenOf(n.intent.targetClass) : `missing:${n.intent.targetClass || n.intent.action || ''}`, str(n.title)); return true; }
        return true;
      }
      return false;
    }
  });
})();
