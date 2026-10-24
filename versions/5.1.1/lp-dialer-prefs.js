/* Android 5.1.1 GoogleDialer (LMY48Y): the Phone app's Settings. GoogleDialerSettingsActivity's headers: General
   (GeneralSettingsFragment), Calls (Telecom's SHOW_CALL_SETTINGS) and Advanced (Caller ID by Google, Nearby places;
   Gservices' dialer_enable_nearby_places_directory defaults on); Calls and Advanced stay limits of the simulator.
   general_settings.xml: Contact display options — Sort by (First name / Last name) and Name format (First name first /
   Last name first), the ContactsPreferences the Contacts app shares; Sounds and vibrate — Phone ringtone (the system
   ringtone and its picker), Dialpad tones and Also vibrate for calls (the system settings Settings > Sound shows);
   Other — Quick responses, Telecom's RespondViaSmsSettings ("Edit quick responses": the four canned responses, each
   edited in the "Quick response" dialog). Name format and Sort by order and spell the names in the Phone and
   Contacts lists ("Family, Given" is the provider's alternative display name). In the toolbar's #0288D1. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (ctx, key) => { const row = window.StockStrings?.dialerprefs?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), key) : ctx.t(key); };
  const CANNED = ["Can't talk now. What's up?", "I'll call you right back.", "I'll call you later.", "Can't talk now. Call me later?"];
  const prefs = data => ({sort: data.contactPrefs?.sort || 'given', order: data.contactPrefs?.order || 'given'});
  function split(name) { const parts = String(name || '').trim().split(/\s+/).filter(Boolean); return {given: parts.slice(0, -1).join(' '), family: parts.length > 1 ? parts.at(-1) : ''}; }
  // ContactsProvider's display_name / display_name_alt and sort_key / sort_key_alt.
  function displayName(person, data) { const {family, given} = split(person.name); return prefs(data).order === 'family' && family ? `${family}, ${given}` : person.name; }
  function sortKey(person, data) { const {family, given} = split(person.name); return prefs(data).sort === 'family' && family ? `${family} ${given}` : person.name; }
  const responses = (ctx, data) => (data.quickResponses || []).length === 4 ? data.quickResponses : CANNED.map(text => S(ctx, text));
  function render(ctx) {
    const {data, ui} = ctx, s = data.settings || {}, page = ui.sub, p = prefs(data);
    const row = (action, id, title, small = '', extra = '') => `<button type="button" class="ldp2-row" data-action="${action}" data-id="${e(id)}"><span class="ldp2-copy"><b>${e(title)}</b>${small ? `<small>${e(small)}</small>` : ''}</span>${extra}</button>`;
    const cat = title => `<h4 class="ldp2-cat">${e(title)}</h4>`;
    const box = on => `<i class="ldp2-check${on ? ' on' : ''}" role="checkbox" aria-checked="${on}"></i>`;
    let title, body;
    if (page === 'dialer-general') {
      title = S(ctx, 'General');
      body = cat(S(ctx, 'Contact display options')) + row('dpr-dialog', 'sort', S(ctx, 'Sort by'), S(ctx, p.sort === 'family' ? 'Last name' : 'First name'))
        + row('dpr-dialog', 'order', S(ctx, 'Name format'), S(ctx, p.order === 'family' ? 'Last name first' : 'First name first'))
        + cat(S(ctx, 'Sounds and vibrate')) + row('dpr-ringtone', '', S(ctx, 'Phone ringtone'), s.ringtone || 'Titania')
        + row('dpr-toggle', 'dialTones', S(ctx, 'Dialpad tones'), '', box(s.dialTones !== false)) + row('dpr-toggle', 'vibrateRing', S(ctx, 'Also vibrate for calls'), '', box(!!s.vibrateRing))
        + cat(S(ctx, 'Other')) + row('dpr-open', 'dialer-quick', S(ctx, 'Quick responses'));
    } else if (page === 'dialer-quick') {
      title = S(ctx, 'Edit quick responses');
      body = responses(ctx, data).map((text, i) => row('dpr-dialog', `quick:${i}`, text)).join('');
    } else {
      title = S(ctx, 'Settings');
      body = row('dpr-open', 'dialer-general', S(ctx, 'General')) + row('toast', 'This feature is not part of the simulator.', S(ctx, 'Calls')) + row('toast', 'This feature is not part of the simulator.', S(ctx, 'Advanced'));
    }
    return `<div class="app-view ldp2-app" data-no-translate><header class="ldp2-bar"><button type="button" class="ldp2-up" data-action="back" aria-label="${e(ctx.t('Navigate up'))}"><img src="assets/lp-fw-ic_ab_back_material.svg" alt=""></button><h2>${e(title)}</h2></header><div class="ldp2-list">${body}</div>${dialog(ctx)}</div>`;
  }
  function dialog(ctx) {
    const {data, ui} = ctx, d = ui.dialerDialog, p = prefs(data);
    if (!d) return '';
    const shell = (title, inner, buttons) => `<div class="ldp2-scrim" data-action="dpr-dialog" data-id=""></div><div class="ldp2-dlg" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3>${inner}<div class="ldp2-buttons">${buttons}</div></div>`;
    const cancel = `<button type="button" data-action="dpr-dialog" data-id="">${e(S(ctx, 'Cancel'))}</button>`;
    if (d === 'sort' || d === 'order') {
      const items = d === 'sort' ? [['given', 'First name'], ['family', 'Last name']] : [['given', 'First name first'], ['family', 'Last name first']], value = p[d];
      return shell(S(ctx, d === 'sort' ? 'Sort by' : 'Name format'), `<div class="ldp2-radios">${items.map(([id, label]) => `<button type="button" class="ldp2-radio${id === value ? ' on' : ''}" data-action="dpr-pick" data-id="${id}" role="radio" aria-checked="${id === value}"><i></i><span>${e(S(ctx, label))}</span></button>`).join('')}</div>`, cancel);
    }
    if (d.startsWith('quick:')) {
      const i = Number(d.slice(6));
      return shell(S(ctx, 'Quick response'), `<form class="ldp2-edit" data-form="dpr-quick"><input name="text" value="${e(responses(ctx, data)[i])}" aria-label="${e(S(ctx, 'Quick response'))}" autocomplete="off"></form>`, cancel + `<button type="button" data-action="dpr-quick-ok">${e(S(ctx, 'OK'))}</button>`);
    }
    return '';
  }
  function handle(action, id, ctx) {
    const {data, ui} = ctx;
    if (action === 'dpr-open') { ui.dialerBack = [...(ui.dialerBack || []), ui.sub]; ui.sub = id; ui.dialerDialog = ''; return 'render'; }
    if (action === 'dpr-dialog') { ui.dialerDialog = id; return 'render'; }
    if (action === 'dpr-pick') { (data.contactPrefs ||= {})[ui.dialerDialog] = id; ui.dialerDialog = ''; return 'save'; }
    if (action === 'dpr-toggle') { (data.settings ||= {})[id] = id === 'dialTones' ? data.settings[id] === false : !data.settings[id]; return 'save'; }
    if (action === 'dpr-quick-ok') return {submit: true};
    return '';
  }
  // The edit dialog's OK: the response replaces that canned one (an empty text keeps the old one).
  function saveQuick(text, ctx) {
    const {data, ui} = ctx, i = Number(String(ui.dialerDialog).slice(6)), list = [...responses(ctx, data)];
    if (String(text).trim()) list[i] = String(text).trim();
    data.quickResponses = list; ui.dialerDialog = '';
  }
  function back(ui) {
    if (ui.dialerDialog) { ui.dialerDialog = ''; return true; }
    if (['dialer-settings', 'dialer-general', 'dialer-quick'].includes(ui.sub)) { ui.sub = (ui.dialerBack || []).pop() ?? ''; return true; }
    return false;
  }
  window.LPDialerPrefs = {render, dialog, handle, saveQuick, back, displayName, sortKey, prefs, responses, CANNED};
})();
