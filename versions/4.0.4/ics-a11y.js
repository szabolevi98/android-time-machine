/* About phone's System updates and Accessibility's TalkBack on the IMM76I image, each from the app that handles it:
   - System updates is Google Services Framework's SystemUpdateActivity (android.settings.SYSTEM_UPDATE_SETTINGS) on
     Theme.Holo.NoActionBar, system_update_activity.xml in the state without an update: the 22 sp holo blue title "Your
     system is currently up to date", the 17 sp description "Last checked for update ^1." (DateUtils'
     getRelativeTimeSpanString with its preposition: the time today, the date before) and the Check now button at the
     bottom right; Check now runs the indeterminate progress bar while the check-in goes and dates the check anew. The
     simulator has no update server, so a check always ends up to date.
   - TalkBack is Settings' ToggleAccessibilityServiceFragment: the service's description (text_description_preference),
     the ToggleSwitch in the action bar, "Use %1$s?" with the security warning before it turns on and "Stop %1$s?" before
     it turns off, and the Settings menu item opening the service's settings activity. Explore by touch
     (ToggleTouchExplorationFragment) shows under System while TalkBack is on, with the "Attention" warning before it
     turns on; its Tutorial stays a limit.
   - TalkBack 3.0.2's TalkBackPreferencesActivity (preferences.xml as its onCreate leaves it on a user build of a phone
     with a vibrator and a proximity sensor: the Developer Settings category goes). The pattern and sound pickers list
     the resource names the APK shows; previewing them stays a limit.
   The simulator speaks nothing: TalkBack's switch, Explore by touch and the preferences are kept, not acted on. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const A = (ctx, key) => { const row = window.StockStrings?.a11y?.[`x.${key}`]; return row ? AndroidStrings.pick(row, ctx.language, row.en || key) : ctx.t(key); };
  const fmt = (...args) => AndroidStrings.format(...args);
  // preferences.xml's defaults.
  const TB_PREFS = {ringer: 0, screenOff: false, callerId: true, proximity: true, bluetooth: false, vibration: true, patternHover: 3, patternActionable: 0, soundback: true, volume: 0, soundHover: 6, soundActionable: 0};
  const PATTERNS = ['actionable', 'clicked', 'focused', 'hovered', 'notification'];
  const SOUNDS = ['actionable', 'button', 'chime_up', 'chime_down', 'explore_begin', 'explore_end', 'hover', 'item', 'open', 'select', 'working'];
  const SUBS = {'sysupdate': 'about', 'talkback': 'accessibility', 'touch-exploration': 'accessibility', 'talkback-settings': 'talkback', 'talkback-vibration': 'talkback-settings', 'talkback-sounds': 'talkback-settings'};
  const tbPrefs = data => ({...TB_PREFS, ...(data.talkbackPrefs || {})});
  const CHECK_MS = 2500;
  // DateUtils.getRelativeTimeSpanString(context, millis, true): "at" the time for today, "on" the date before.
  function lastCheck(ctx) {
    const now = ctx.now(), at = new Date(ctx.data.settings.updateChecked ?? now.getTime() - 3 * 3600000), sameDay = at.toDateString() === now.toDateString();
    const text = sameDay ? at.toLocaleTimeString(ctx.locale, {hour: 'numeric', minute: '2-digit', hour12: ctx.data.settings.hour24 === false})
      : at.toLocaleDateString(ctx.locale, {month: 'short', day: 'numeric', ...(at.getFullYear() === now.getFullYear() ? {} : {year: 'numeric'})});
    return fmt(A(ctx, sameDay ? 'at %s' : 'on %s'), text);
  }
  const toggle = (action, on, label, ctx) => `<button class="holo-switch settings-action-switch${on ? ' on' : ''}" data-action="${action}" role="switch" aria-checked="${!!on}" aria-label="${e(label)}"><span class="switch-label" aria-hidden="true">${e(A(ctx, on ? 'ON' : 'OFF'))}</span></button>`;
  const textAction = (action, label) => `<button class="sx-text-action" data-action="${action}">${e(label.toUpperCase())}</button>`;
  const check = (key, title, on, summary = '', disabled = false) => `<button class="settings-row" data-action="icsa-pref" data-id="${key}" role="checkbox" aria-checked="${!!on}"${disabled ? ' disabled' : ''}><span class="row-copy">${e(title)}${summary ? `<small>${e(summary)}</small>` : ''}</span><img class="holo-checkbox" src="assets/btn_check_${on ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
  const row = (action, id, title, summary = '', disabled = false) => `<button class="settings-row" data-action="${action}" data-id="${e(id)}"${disabled ? ' disabled' : ''}><span class="row-copy">${e(title)}${summary ? `<small>${e(summary)}</small>` : ''}</span></button>`;
  const section = title => `<h3 class="section-label">${e(title)}</h3>`;

  function render(ctx) {
    const {ui, data} = ctx, s = data.settings;
    if (ui.sub === 'sysupdate') {
      const checking = (ui.icsaCheck || 0) > Date.now();
      return {full: `<div class="app-view icsa-update"><h1>${e(A(ctx, 'Your system is currently up to date'))}</h1>${checking ? '<div class="icsa-progress" role="progressbar"><i></i></div>' : ''}<div class="icsa-update-scroll"><p>${e(fmt(A(ctx, 'Last checked for update ^1.').replace('^1', '%s'), lastCheck(ctx)))}</p></div><div class="icsa-update-bottom"><button class="icsa-button" data-action="icsa-check"${checking ? ' disabled' : ''}>${e(A(ctx, 'Check now'))}</button></div></div>`};
    }
    if (ui.sub === 'talkback') return {title: A(ctx, 'TalkBack'), body: `<p class="icsa-desc">${e(A(ctx, 'talkback description'))}</p>`, right: textAction('icsa-tb-settings', A(ctx, 'Settings')) + toggle('icsa-tb-toggle', !!s.talkback, A(ctx, 'TalkBack'), ctx)};
    if (ui.sub === 'touch-exploration') return {title: A(ctx, 'Explore by touch'), body: `<p class="icsa-desc">${e(A(ctx, 'touch exploration summary').replace(/\n\s*\n/g, '\n\n'))}</p>`, right: textAction('icsa-tutorial', A(ctx, 'Tutorial')) + toggle('icsa-te-toggle', !!s.touchExploration, A(ctx, 'Explore by touch'), ctx)};
    const p = tbPrefs(data);
    if (ui.sub === 'talkback-settings') return {title: A(ctx, 'TalkBack'), body: section(A(ctx, 'When to Speak')) + row('icsa-dialog', 'ringer', A(ctx, 'Ringer volume'), A(ctx, `ringer.${p.ringer}`))
      + check('screenOff', A(ctx, 'Speak when screen is off'), p.screenOff) + check('callerId', A(ctx, 'Speak caller ID'), p.callerId)
      + check('proximity', A(ctx, 'Use proximity sensor'), p.proximity, A(ctx, p.proximity ? 'proximity on' : 'proximity off')) + check('bluetooth', A(ctx, 'Bluetooth output'), p.bluetooth, A(ctx, p.bluetooth ? 'bluetooth on' : 'bluetooth off'))
      + section(A(ctx, 'Feedback Settings')) + check('vibration', A(ctx, 'Vibration feedback'), p.vibration) + row('settings-sub', 'talkback-vibration', A(ctx, 'Assign vibration patterns'), '', !p.vibration)
      + check('soundback', A(ctx, 'Sound feedback'), p.soundback) + row('icsa-dialog', 'volume', A(ctx, 'Sound volume'), A(ctx, `volume.${p.volume}`), !p.soundback) + row('settings-sub', 'talkback-sounds', A(ctx, 'Assign sounds'), '', !p.soundback)};
    if (ui.sub === 'talkback-vibration') return {title: A(ctx, 'Assign vibration patterns'), body: row('icsa-dialog', 'patternHover', A(ctx, 'Explore by touch (pattern)'), PATTERNS[p.patternHover]) + row('icsa-dialog', 'patternActionable', A(ctx, 'Exploring clickable items'), PATTERNS[p.patternActionable])};
    if (ui.sub === 'talkback-sounds') return {title: A(ctx, 'Assign sounds'), body: row('icsa-dialog', 'soundHover', A(ctx, 'Explore by touch (pattern)'), SOUNDS[p.soundHover]) + row('icsa-dialog', 'soundActionable', A(ctx, 'Exploring clickable items'), SOUNDS[p.soundActionable])};
    return null;
  }
  // The dialogs: the service's enable / disable warnings, touch exploration's, and the list preferences.
  function overlay(ctx) {
    const {ui, data} = ctx, d = ui.icsaDialog, p = tbPrefs(data), name = A(ctx, 'TalkBack');
    const buttons = ok => `<div class="settings-dialog-actions"><button data-action="close-overlay">${e(A(ctx, 'Cancel'))}</button><button data-action="${ok}">${e(A(ctx, 'OK'))}</button></div>`;
    const warn = (title, text, ok) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog icsa-warning" role="dialog" aria-label="${e(title)}"><h3><img src="assets/icsa-ic_dialog_alert_holo_dark.png" alt="">${e(title)}</h3><p>${e(text)}</p>${buttons(ok)}</div>`;
    const list = (title, key, entries) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3><div class="icsa-list">${entries.map((label, i) => `<button class="settings-row wireless-row" data-action="icsa-pick" data-id="${key}:${i}" role="radio" aria-checked="${p[key] === i}"><span class="row-copy">${e(label)}</span><img class="holo-radio" src="assets/btn_radio_${p[key] === i ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}</div><div class="settings-dialog-actions"><button data-action="close-overlay">${e(A(ctx, 'Cancel'))}</button></div></div>`;
    if (d === 'tb-enable') return warn(fmt(A(ctx, 'Use %1$s?'), name), fmt(A(ctx, 'security warning'), name), 'icsa-tb-on');
    if (d === 'tb-disable') return warn(fmt(A(ctx, 'Stop %1$s?'), name), fmt(A(ctx, 'Touching OK will stop %1$s.'), name), 'icsa-tb-off');
    if (d === 'te-enable') return warn(A(ctx, 'Attention'), A(ctx, 'touch exploration warning'), 'icsa-te-on');
    if (d === 'ringer') return list(A(ctx, 'Ringer volume'), 'ringer', [0, 1, 2].map(i => A(ctx, `ringer.${i}`)));
    if (d === 'volume') return list(A(ctx, 'Sound volume'), 'volume', [0, 1, 2].map(i => A(ctx, `volume.${i}`)));
    if (d === 'patternHover' || d === 'patternActionable') return list(A(ctx, d === 'patternHover' ? 'Explore by touch (pattern)' : 'Exploring clickable items'), d, PATTERNS);
    if (d === 'soundHover' || d === 'soundActionable') return list(A(ctx, d === 'soundHover' ? 'Explore by touch (pattern)' : 'Exploring clickable items'), d, SOUNDS);
    return '';
  }
  function handle(action, id, ctx) {
    const {ui, data} = ctx, s = data.settings;
    const dialog = name => { ui.icsaDialog = name; ui.overlay = 'icsa-dialog'; ctx.renderOverlay(); };
    const close = () => { ui.overlay = ''; ui.icsaDialog = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'icsa-check': {
        ui.icsaCheck = Date.now() + CHECK_MS; ctx.render();
        setTimeout(() => { s.updateChecked = ctx.now().getTime(); ctx.save(); if (ui.view === 'settings' && ui.sub === 'sysupdate') ctx.render(); }, CHECK_MS + 30);
        return true;
      }
      case 'icsa-tb-toggle': dialog(s.talkback ? 'tb-disable' : 'tb-enable'); return true;
      case 'icsa-tb-on': case 'icsa-tb-off': s.talkback = action === 'icsa-tb-on'; if (!s.talkback) s.touchExploration = false; ctx.save(); close(); ctx.render(); return true;
      case 'icsa-te-toggle': if (s.touchExploration) { s.touchExploration = false; ctx.save(); ctx.render(); } else dialog('te-enable'); return true;
      case 'icsa-te-on': s.touchExploration = true; ctx.save(); close(); ctx.render(); return true;
      case 'icsa-tb-settings': ui.sub = 'talkback-settings'; ctx.render(); return true;
      case 'icsa-tutorial': ctx.toast('This feature is not part of the simulator.'); return true;
      case 'icsa-dialog': dialog(id); return true;
      case 'icsa-pref': { const p = tbPrefs(data); data.talkbackPrefs = {...(data.talkbackPrefs || {}), [id]: !p[id]}; ctx.save(); ctx.render(); return true; }
      case 'icsa-pick': { const [key, value] = id.split(':'); data.talkbackPrefs = {...(data.talkbackPrefs || {}), [key]: Number(value)}; ctx.save(); close(); ctx.render(); return true; }
      default: return false;
    }
  }
  // Back from these screens to the one they open from.
  function back(ui) {
    if (!(ui.sub in SUBS)) return false;
    ui.sub = SUBS[ui.sub]; return true;
  }
  window.ICSA11y = {render, overlay, handle, back, TB_PREFS};
})();
