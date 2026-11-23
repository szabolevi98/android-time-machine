/* Android 7.1.2 CellBroadcastReceiver's CellBroadcastSettings (Sound › Emergency broadcasts), drawn by ng-appprefs.js
   from its res/xml/preferences.xml (android-7.1.2_r1 source in _aosp/aosp712/cbr). What the code removes on angler:
   bool/show_etws_settings and show_brazil_settings are false, show_cmas_settings true, no carrier forces anything and
   the SIM is not Brazilian; so without developer options "Turn on notifications", "Speak alert message", the ETWS, Brazil
   and developer categories go; with them the first two, ETWS and the developer category stay. "Show severe threats" is
   enabled only while "Show extreme threats" is checked. initReminderIntervalList keeps array
   alert_reminder_interval_active_values (1, 2, 15, 0) with their entries.
   '@list' is CellBroadcastListActivity (app_label), which Messenger's Wireless alerts starts: no alert has come, so
   the empty text no_cell_broadcasts; the overflow holds Settings (menu_preferences) only, Delete broadcasts being
   hidden while the list is empty; Settings opens CellBroadcastSettings over it. */
(() => {
  'use strict';
  const ACTIVE = ['1', '2', '15', '0'];
  const dev = c => !!c.data.settings?.devOptions;
  const CB = k => NG.appPrefStr('string/CellBroadcastReceiver/' + k);
  NG.appPrefsHooks.cellbroadcast = {
    hide(c, key) {
      if (key === 'category_brazil_settings') return true;
      return !dev(c) && ['enable_emergency_alerts', 'enable_alert_speech', 'category_etws_settings', 'category_dev_settings'].includes(key);
    },
    enabled(c, key) { if (key === 'enable_cmas_severe_threat_alerts') return NG.appPref(c, 'cellbroadcast', 'enable_cmas_extreme_threat_alerts', true); return undefined; },
    customs: {'@list': {
      title: () => CB('app_label'),
      render: c => `<p class="ngap-empty">${c.safe(CB('no_cell_broadcasts'))}</p>`,
      actions: c => NG.menu.button(c),
      action(c, name, el) { if (name !== 'ng-menu') return false; c.menu([{label: CB('menu_preferences'), action: c => NG.appPrefsGo(c, 'preferences', CB('sms_cb_settings'))}], el); return true; }
    }}
  };
  // The reminder list with only the active intervals, in their order.
  const node = (n, key) => { if (n?.key === key) return n; for (const k of n?.c || []) { const f = node(k, key); if (f) return f; } return null; };
  const reminder = node(NG.appPrefsXml?.cellbroadcast?.xml?.preferences, 'alert_reminder_interval');
  if (reminder) {
    const values = reminder.entryValues, entries = reminder.entries;
    Object.defineProperty(reminder, 'entryValues', {value: ACTIVE});
    Object.defineProperty(reminder, 'entries', {get: () => { const all = NG.appPrefArr(entries); return ACTIVE.map(v => all[values.indexOf(v)]); }});
  }
})();
