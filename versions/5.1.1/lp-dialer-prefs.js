/* Android 5.1.1 GoogleDialer (LMY48Y): the Phone app's Settings. GoogleDialerSettingsActivity's headers: General
   (GeneralSettingsFragment), Calls (Telecom's SHOW_CALL_SETTINGS) and Advanced (advanced_settings.xml).
   general_settings.xml: Contact display options — Sort by (First name / Last name) and Name format (First name first /
   Last name first), the ContactsPreferences the Contacts app shares; Sounds and vibrate — Phone ringtone (the system
   ringtone and its picker), Dialpad tones and Also vibrate for calls (the system settings Settings > Sound shows);
   Other — Quick responses, Telecom's RespondViaSmsSettings ("Edit quick responses": the four canned responses, each
   edited in the "Quick response" dialog). Name format and Sort by order and spell the names in the Phone and
   Contacts lists ("Family, Given" is the provider's alternative display name). In the toolbar's #0288D1.
   Calls is TeleService's CallFeaturesSetting (call_feature_setting.xml) as it shows on the shamu, a GSM phone with one
   SIM: its config drops Auto-retry (auto_retry_enabled), DTMF tones (dtmf_type_enabled), video calling (no VT) and the
   CDMA settings; TTY mode (Telecom tty_enabled) and Hearing aids (hac_enabled) stay. Calling accounts is
   PhoneAccountSettingsActivity with one account: only its SIP settings (config_built_in_sip_phone) — SIP accounts
   (SipSettings, the empty list; adding an account is a real account, a limit), Use SIP calling, Receive incoming calls.
   Voicemail: Service (Your carrier), Setup's Voicemail number, Sound (a notification sound) and Vibrate. Fixed Dialing
   Numbers needs the SIM's PIN2 and SIM writes (limits). GSM call settings: Call forwarding (CallForwardEditPreference
   rows, Off; forwarding is the carrier's, a limit) and Additional settings (Caller ID, Call waiting). The values are
   kept on the phone (data.callPrefs); TTY mode shows its entry as summary (TtyModeListPreference).
   Advanced: Caller ID by Google and Nearby places (google_caller_id_setting.xml / local_search_setting.xml: the 16 sp
   Switch 20 dp in, the #dedede rule, the 14 sp text; its web links are not followed); both on by default, the
   summary follows the switch. */
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
  // Calls and Advanced values: TTY Off, no hearing aid mode, SIP for SIP calls only, Network default caller ID,
  // call waiting on, both Google features on.
  const CALL = {tty: 0, hac: false, sipCalling: 1, sipReceive: false, vmNumber: '', vmVibrate: false, clir: 0, cw: true, callerId: true, nearby: true};
  const call = data => ({...CALL, ...data.callPrefs});
  const TTY = ['TTY Off', 'TTY Full', 'TTY HCO', 'TTY VCO'], SIP = ['For all calls when data network is available', 'Only for SIP calls'];
  const CLIR = [['Network default', 'Use default operator settings to display my number in outgoing calls'], ['Hide number', 'Number hidden in outgoing calls'], ['Show number', 'Number displayed in outgoing calls']];
  const PAGES = ['dialer-settings', 'dialer-general', 'dialer-quick', 'dialer-calls', 'dialer-accounts', 'dialer-sip', 'dialer-voicemail', 'dialer-vmsetup', 'dialer-fdn', 'dialer-gsm', 'dialer-cf', 'dialer-additional', 'dialer-advanced', 'dialer-callerid', 'dialer-nearby'];
  const LIMIT = 'This feature is not part of the simulator.';
  // The fragments' HTML text: line breaks kept, links shown as their words (they lead to the web).
  const prose = text => e(String(text).replace(/\s+/g, ' ').replace(/<a [^>]*>|<\/a>/g, '')).replace(/&lt;br&gt;/g, '<br>').replace(/(<br>\s*){2,}/g, '<br><br>');
  const responses = (ctx, data) => (data.quickResponses || []).length === 4 ? data.quickResponses : CANNED.map(text => S(ctx, text));
  function render(ctx) {
    const {data, ui} = ctx, s = data.settings || {}, page = ui.sub, p = prefs(data), c = call(data);
    let action = '';
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
    } else if (page === 'dialer-calls') {
      title = S(ctx, 'Call settings');
      body = row('dpr-open', 'dialer-accounts', S(ctx, 'Calling accounts')) + row('dpr-open', 'dialer-voicemail', S(ctx, 'Voicemail')) + row('dpr-open', 'dialer-fdn', S(ctx, 'Fixed Dialing Numbers'))
        + row('dpr-dialog', 'tty', S(ctx, 'TTY mode'), S(ctx, TTY[c.tty])) + row('dpr-call', 'hac', S(ctx, 'Hearing aids'), S(ctx, 'Turn on hearing aid compatibility'), box(c.hac))
        + row('dpr-open', 'dialer-gsm', S(ctx, 'GSM call settings'), S(ctx, 'Additional GSM only call settings'));
    } else if (page === 'dialer-accounts') {
      title = S(ctx, 'Calling accounts');
      body = cat(S(ctx, 'SIP settings')) + row('dpr-open', 'dialer-sip', S(ctx, 'SIP accounts')) + row('dpr-dialog', 'sip', S(ctx, 'Use SIP calling'), S(ctx, SIP[c.sipCalling]))
        + row('dpr-call', 'sipReceive', S(ctx, 'Receive incoming calls'), S(ctx, 'Uses more battery life'), box(c.sipReceive));
    } else if (page === 'dialer-sip') {
      title = S(ctx, 'SIP accounts'); action = `<button type="button" class="ldp2-act" data-action="toast" data-id="${e(LIMIT)}">${e(S(ctx, 'Add account'))}</button>`;
      body = cat(S(ctx, 'SIP accounts'));
    } else if (page === 'dialer-voicemail') {
      title = S(ctx, 'Voicemail');
      body = row('dpr-dialog', 'vmprovider', S(ctx, 'Service'), S(ctx, 'Your carrier')) + row('dpr-open', 'dialer-vmsetup', S(ctx, 'Setup'))
        + row('dpr-vmtone', '', S(ctx, 'Sound'), s.vmTone ?? s.notificationTone ?? 'Tethys') + row('dpr-call', 'vmVibrate', S(ctx, 'Vibrate'), '', box(c.vmVibrate));
    } else if (page === 'dialer-vmsetup') {
      title = S(ctx, 'Setup');
      body = row('dpr-dialog', 'vmnumber', S(ctx, 'Voicemail number'), c.vmNumber || S(ctx, '<Not set>'));
    } else if (page === 'dialer-fdn') {
      title = S(ctx, 'Fixed Dialing Numbers');
      body = row('toast', LIMIT, S(ctx, 'FDN activation'), S(ctx, 'Fixed Dialing Numbers are disabled')) + row('toast', LIMIT, S(ctx, 'Change PIN2'), S(ctx, 'Change PIN for FDN access')) + row('toast', LIMIT, S(ctx, 'FDN list'), S(ctx, 'Manage phone number list'));
    } else if (page === 'dialer-gsm') {
      title = S(ctx, 'GSM call settings');
      body = row('dpr-open', 'dialer-cf', S(ctx, 'Call forwarding')) + row('dpr-open', 'dialer-additional', S(ctx, 'Additional settings'));
    } else if (page === 'dialer-cf') {
      title = S(ctx, 'Call forwarding');
      body = [['Always forward', 'Off'], ['When busy', 'Off'], ['When unanswered', 'Off'], ['When unreachable', 'Disabled']].map(([label, state]) => row('toast', LIMIT, S(ctx, label), S(ctx, state))).join('');
    } else if (page === 'dialer-additional') {
      title = S(ctx, 'Additional settings');
      body = row('dpr-dialog', 'clir', S(ctx, 'Caller ID'), S(ctx, CLIR[c.clir][1])) + row('dpr-call', 'cw', S(ctx, 'Call waiting'), S(ctx, 'During a call, notify me of incoming calls'), box(c.cw));
    } else if (page === 'dialer-advanced') {
      title = S(ctx, 'Advanced');
      body = row('dpr-open', 'dialer-callerid', S(ctx, 'Caller ID by Google'), c.callerId ? S(ctx, 'Show names for people and businesses not in your contacts.') : S(ctx, 'Advanced-Off'))
        + row('dpr-open', 'dialer-nearby', S(ctx, 'Nearby places'), c.nearby ? S(ctx, 'Display search results for nearby places') : S(ctx, 'Advanced-Off'));
    } else if (page === 'dialer-callerid' || page === 'dialer-nearby') {
      const key = page === 'dialer-callerid' ? 'callerId' : 'nearby', on = !!c[key];
      title = S(ctx, 'Advanced');
      body = `<button type="button" class="ldp2-switchrow" data-action="dpr-call" data-id="${key}" role="switch" aria-checked="${on}"><span>${e(S(ctx, key === 'callerId' ? 'Caller ID by Google' : 'Nearby places'))}</span><i class="ldp2-switch${on ? ' on' : ''}"></i></button><p class="ldp2-prose">${prose(S(ctx, key === 'callerId' ? 'caller-id-text' : 'nearby-text'))}</p>`
        + (key === 'nearby' && s.location === false ? `<button type="button" class="ldp2-button" data-action="dpr-location">${e(S(ctx, 'Go to location settings'))}</button>` : '');
    } else {
      title = S(ctx, 'Settings');
      body = row('dpr-open', 'dialer-general', S(ctx, 'General')) + row('dpr-open', 'dialer-calls', S(ctx, 'Calls')) + row('dpr-open', 'dialer-advanced', S(ctx, 'Advanced'));
    }
    return `<div class="app-view ldp2-app" data-no-translate><header class="ldp2-bar"><button type="button" class="ldp2-up" data-action="back" aria-label="${e(ctx.t('Navigate up'))}"><img src="assets/lp-fw-ic_ab_back_material.svg" alt=""></button><h2>${e(title)}</h2>${action}</header><div class="ldp2-list">${body}</div>${dialog(ctx)}</div>`;
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
    const c = call(data), radios = (items, value, pick = 'dpr-callpick') => `<div class="ldp2-radios">${items.map((label, i) => `<button type="button" class="ldp2-radio${i === value ? ' on' : ''}" data-action="${pick}" data-id="${i}" role="radio" aria-checked="${i === value}"><i></i><span>${e(S(ctx, label))}</span></button>`).join('')}</div>`;
    if (d === 'tty') return shell(S(ctx, 'TTY mode'), radios(TTY, c.tty), cancel);
    if (d === 'sip') return shell(S(ctx, 'Use SIP calling'), radios(SIP, c.sipCalling), cancel);
    if (d === 'clir') return shell(S(ctx, 'Caller ID'), radios(CLIR.map(([label]) => label), c.clir), cancel);
    if (d === 'vmprovider') return shell(S(ctx, 'Service'), radios(['Your carrier'], 0, 'dpr-dialog'), cancel);
    if (d === 'vmnumber') return shell(S(ctx, 'Voicemail number'), `<form class="ldp2-edit" data-form="dpr-vmnumber"><input name="text" type="tel" value="${e(c.vmNumber)}" aria-label="${e(S(ctx, 'Voicemail number'))}" autocomplete="off"></form>`, cancel + `<button type="button" data-action="dpr-vmnumber-ok">${e(S(ctx, 'OK'))}</button>`);
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
    if (action === 'dpr-call') { const c = call(data); data.callPrefs = {...data.callPrefs, [id]: !c[id]}; return 'save'; }
    if (action === 'dpr-callpick') { const key = {tty: 'tty', sip: 'sipCalling', clir: 'clir'}[ui.dialerDialog]; if (key) data.callPrefs = {...data.callPrefs, [key]: Number(id)}; ui.dialerDialog = ''; return 'save'; }
    if (action === 'dpr-vmnumber-ok') return {vmnumber: true};
    return '';
  }
  // The edit dialog's OK: the response replaces that canned one (an empty text keeps the old one).
  function saveQuick(text, ctx) {
    const {data, ui} = ctx, i = Number(String(ui.dialerDialog).slice(6)), list = [...responses(ctx, data)];
    if (String(text).trim()) list[i] = String(text).trim();
    data.quickResponses = list; ui.dialerDialog = '';
  }
  // The voicemail number dialog's OK: digits and the dial characters a number may hold.
  function saveVoicemail(text, ctx) { const {data, ui} = ctx; data.callPrefs = {...data.callPrefs, vmNumber: String(text).replace(/[^\d+*#,;() -]/g, '').trim()}; ui.dialerDialog = ''; }
  function back(ui) {
    if (ui.dialerDialog) { ui.dialerDialog = ''; return true; }
    if (PAGES.includes(ui.sub)) { ui.sub = (ui.dialerBack || []).pop() ?? ''; return true; }
    return false;
  }
  window.LPDialerPrefs = {render, dialog, handle, saveQuick, saveVoicemail, back, displayName, sortKey, prefs, responses, call, CANNED, PAGES};
})();
