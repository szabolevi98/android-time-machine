/* Cell Broadcasts (JWR66Y app/CellBroadcastReceiver), opened as Settings pages, as in versions/5.1.1:
   - 'cb-list' (CellBroadcastListActivity, label app_label "Cell Broadcasts"): Messaging's menu item Cell broadcasts
     (Mms ConversationList, shown as config_cellBroadcastAppLinks is true on mako) starts it. The demo phone has
     received no alert, so cell_broadcast_list_screen.xml shows no_cell_broadcasts; the overflow holds Settings
     (menu_preferences) only, Delete broadcasts being hidden while the list is empty.
   - 'cb-settings' (CellBroadcastSettings, label sms_cb_settings): Settings › More › Cell broadcasts
     (wireless_settings.xml's last row, cell_broadcast_settings) and the list's Settings. res/xml/preferences.xml as
     CellBroadcastSettings trims it on the Nexus 4: show_cmas_settings true, show_etws_settings and show_brazil_settings
     false and no Brazilian SIM, so Turn on notifications, Alert sound duration, Speak alert message and the ETWS and
     developer categories only appear while Developer options are on; Show severe threats follows Show extreme threats.
   Holo dark rows with btn_check_holo_dark check boxes. Values live in data.cellBroadcast. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const DEFAULTS = {extreme: true, severe: true, amber: true, emergency: true, duration: '4', reminder: '0', vibrate: true, speech: true, etwsTest: false, channel50: true, cmasTest: false, optOut: true};
  // alert_sound_duration_entries / _values and alert_reminder_interval_entries / _values.
  const LISTS = {
    duration: ['Alert sound duration', [['2', '2 seconds'], ['4', '4 seconds'], ['6', '6 seconds'], ['8', '8 seconds'], ['10', '10 seconds']]],
    reminder: ['Alert reminder', [['1', 'Once'], ['2', 'Every 2 minutes'], ['15', 'Every 15 minutes'], ['0', 'Off']]]
  };
  const prefs = data => ({...DEFAULTS, ...(data.cellBroadcast || {})});
  const devOn = data => !!data.settings?.developerUnlocked && data.settings?.developerEnabled !== false;
  const S = key => { const row = window.StockStrings?.cellbroadcast?.[key]; return row ? AndroidStrings.pick(row, window.AndroidI18n?.language, key) : key; };
  function page(sub, {data, t}) {
    if (sub === 'cb-list') return {title: S('Cell Broadcasts'), body: `<p class="cb-empty">${e(S('There are no active alerts in your area. You can change the Alert settings using the Settings menu option.'))}</p>`, right: `<button class="sx-overflow" data-action="cb-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`};
    if (sub !== 'cb-settings') return null;
    const p = prefs(data), dev = devOn(data);
    const check = (key, title, summary, off = false) => `<button class="settings-row" data-action="cb-toggle" data-id="${key}" role="checkbox" aria-checked="${!!p[key]}"${off ? ' disabled' : ''}><span class="row-copy">${e(S(title))}<small>${e(S(summary))}</small></span><img class="holo-checkbox" src="assets/btn_check_${p[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
    const list = key => { const [title, entries] = LISTS[key]; return `<button class="settings-row" data-action="cb-list-pref" data-id="${key}"><span class="row-copy">${e(S(title))}<small>${e(S((entries.find(([v]) => v === p[key]) || entries[0])[1]))}</small></span></button>`; };
    const cat = title => `<h3 class="section-label">${e(S(title))}</h3>`;
    let body = cat('Emergency alert settings')
      + check('extreme', 'Show extreme threats', 'Display alerts for extreme threats to life and property')
      + check('severe', 'Show severe threats', 'Display alerts for severe threats to life and property', !p.extreme)
      + check('amber', 'Show AMBER alerts', 'Display child abduction emergency bulletins (AMBER alert)')
      + (dev ? check('emergency', 'Turn on notifications', 'Display emergency alert broadcasts') + list('duration') : '')
      + list('reminder')
      + check('vibrate', 'Vibrate', 'Vibrate on alert')
      + (dev ? check('speech', 'Speak alert message', 'Use text-to-speech to speak emergency alert messages') : '');
    if (dev) body += cat('ETWS settings') + check('etwsTest', 'Show ETWS test broadcasts', 'Display test broadcasts for Earthquake Tsunami Warning System')
      + cat('Developer options') + check('cmasTest', 'Show CMAS test broadcasts', 'Display test broadcasts for Commercial Mobile Alert System') + check('optOut', 'Show opt-out dialog', 'Show an opt-out dialog after displaying the first CMAS alert (other than Presidential Alert).');
    return {title: S('Cell Broadcast settings'), body};
  }
  function overlay(ui, data, t) {
    if (ui.overlay === 'cb-menu') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="cb-open-settings">${e(S('Settings'))}</button></div>`;
    if (ui.overlay !== 'cb-dialog' || !LISTS[ui.cbField]) return '';
    const [title, entries] = LISTS[ui.cbField], value = prefs(data)[ui.cbField];
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog sd-dialog" role="dialog" aria-label="${e(S(title))}" data-form="cb-choice"><h3>${e(S(title))}</h3><div class="sd-choice-list">${entries.map(([id, name]) => `<label><span>${e(S(name))}</span><input type="radio" name="choice" value="${id}"${id === value ? ' checked' : ''}></label>`).join('')}</div><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">${e(t('Cancel'))}</button><button type="submit">${e(t('OK'))}</button></div></form>`;
  }
  const set = (data, patch) => { data.cellBroadcast = {...prefs(data), ...patch}; };
  // ctx: {data, ui, save, render, renderOverlay}
  function handle(action, id, ctx) {
    const {data, ui} = ctx;
    switch (action) {
      case 'cb-open': ui.cbFromList = false; ui.cbReturn = ''; ui.sub = 'cb-settings'; ctx.render(); return true;
      case 'cb-menu': ui.overlay = 'cb-menu'; ctx.renderOverlay(); return true;
      case 'cb-open-settings': ui.overlay = ''; ctx.renderOverlay(); ui.cbFromList = true; ui.sub = 'cb-settings'; ctx.render(); return true;
      case 'cb-toggle': if (!(id in DEFAULTS) || (id === 'severe' && !prefs(data).extreme)) return true; set(data, {[id]: !prefs(data)[id]}); ctx.save(); ctx.render(); return true;
      case 'cb-list-pref': if (!LISTS[id]) return true; ui.cbField = id; ui.overlay = 'cb-dialog'; ctx.renderOverlay(); return true;
    }
    return false;
  }
  function submit(form, values, ctx) {
    if (form !== 'cb-choice') return false;
    const {data, ui} = ctx, choice = String(values.get('choice') || '');
    if (LISTS[ui.cbField]?.[1].some(([v]) => v === choice)) { set(data, {[ui.cbField]: choice}); ctx.save(); }
    ui.overlay = ''; ctx.renderOverlay(); ctx.render(); return true;
  }
  // Back: the settings return to the list they came from, the list to the app that opened it (Messenger).
  function back(ui, openApp) {
    if (ui.sub === 'cb-settings') { ui.sub = ui.cbFromList ? 'cb-list' : 'wireless'; ui.cbFromList = false; return true; }
    if (ui.sub === 'cb-list') { const from = ui.cbReturn; ui.cbReturn = ''; ui.sub = 'wireless'; if (from) openApp(from, true); return true; }
    return false;
  }
  // Settings › More's last row (wireless_settings.xml cell_broadcast_settings).
  const row = () => `<button class="settings-row wireless-row" data-action="cb-open"><span class="row-copy">${e(S('Cell broadcasts'))}</span></button>`;
  window.CellBroadcast = {DEFAULTS, prefs, page, overlay, handle, submit, back, row};
})();
