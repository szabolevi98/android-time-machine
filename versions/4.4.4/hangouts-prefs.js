/* Hangouts 2.0.303 (the KTU84P image's Hangouts.apk, the Nexus 5's SMS app) beyond its conversations: Settings,
   Invites, Blocked People, People & options and New group MMS. From the APK:
   - Settings: with one account BabelSettingsActivity lays the account's babel_settings.xml over
     general_settings_for_single_account.xml. The account: Profile photo, Share your status (rich_status_settings.xml:
     Set your mood, Device, In call), HANGOUT NOTIFICATIONS (Notifications, Sound, Vibrate, Invites), VIDEO CALLS (Sound,
     Vibrate), HOW OTHERS GET IN TOUCH WITH YOU (Customize invites: chat_acl_settings.xml's EVERYONE ELSE list, Hangout
     with you / Invite only), ACCOUNT (Google+ profile, Blocked people, Sign out; the settings code keeps Google+ profile
     and drops Join Google+ for an account with a profile, and drops Confirm phone number without the server's
     verification flag) and Improve Hangouts; then General: SMS (smsmms_settings.xml: SMS Enabled for the default SMS
     app, Account to show SMS in, Notifications with Sound and Vibrate, Advanced) and About Google+ Hangouts
     (about_babel.xml, Build version 2.0.303 (1004807-30)).
   - Invites (no_invites_text) and Blocked People (blocked_people_fragment.xml, ic_zero_blocked over "No blocked
     people"; the list rows have the Unblock button).
   - People & options (ConversationParticipantsFragment): for an SMS conversation HANGOUT OPTIONS holds Notifications
     (level 30 ticked, 10 not) and, for a group, Delete; then PEOPLE IN THIS HANGOUT. Blocking, Rename and Add People
     are for Hangouts chats, which this phone's demo account has none of. The menu (conversation_participants_fragment_menu
     with onPrepareOptionsMenu): New group Hangout for one person, Settings and Help.
   - ConversationFragment.onPrepareOptionsMenu titles the conversation's Add people item "New group MMS" for one SMS
     person; it opens the audience (uber_edit_audience_fragment.xml with new_conversation_activity_buttons.xml: Cancel
     and OK on the translucent green bar).
   What they change here: the SMS Notifications switch, a conversation's Notifications and a snooze decide whether an
   answer posts a notification; a group MMS conversation keeps its members. Profile photo, Set your mood, Sign out and
   the About page's web links stay account-service limits. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const lang = () => String(globalThis.document?.documentElement?.lang || '').slice(0, 2);
  const S = key => { const row = window.StockStrings?.hangouts?.[`hp.${key}`]; return row ? AndroidStrings.pick(row, lang(), row.en || key) : key; };
  const ACCOUNT = 'kitkat.demo@gmail.com', BUILD = '2.0.303 (1004807-30)';
  const AVATAR = 'assets/hg-default_avatar.png';
  // The XML defaults: chat notifications on, vibrate and invites on; video vibrate on; Improve Hangouts on; SMS
  // notifications and vibrate on, Group messaging and Auto retrieve MMS on.
  const DEFAULTS = {chatOn: true, chatVibrate: true, chatInvites: true, videoVibrate: true, improve: true, statusDevice: false, statusInCall: false, acl: 'INVITE',
    smsOn: true, smsVibrate: true, groupMms: true, deleteOld: false, delivery: false, autoMms: true, roamingMms: false};
  const prefs = data => ({...DEFAULTS, ...(data.hgPrefs || {})});
  const conv = (data, key) => data.hgConv?.[key] || {};
  const blocked = data => data.hgBlocked || [];
  const isGroup = key => /^g\d+$/.test(String(key));
  const group = (data, key) => data.hgGroups?.[key];
  const contact = (data, id) => data.contacts.find(p => String(p.id) === String(id));
  function who(data, key) {
    if (!isGroup(key)) return ICSMessaging.identity(key, data.contacts);
    const people = (group(data, key)?.members || []).map(id => contact(data, id)).filter(Boolean);
    return {name: people.map(p => p.name).join(', '), phone: '', group: true, people};
  }
  const tones = kind => ['', ...Object.values(window.SystemSounds?.SOUNDS?.[kind] || {}).map(([title]) => title)];
  const defaultTone = kind => { const key = window.SystemSounds?.DEFAULTS?.[kind]; return window.SystemSounds?.SOUNDS?.[kind]?.[key]?.[0] || ''; };
  const toneOf = (value, kind) => value === undefined ? defaultTone(kind) : value;
  // An SMS answer notifies with SMS notifications on, the conversation not set quiet and no snooze running.
  const notifies = (data, key, now = Date.now()) => prefs(data).smsOn && !(data.hgSnooze > now) && !conv(data, key).quiet;

  const tick = on => `<i class="hgp-check${on ? ' on' : ''}" role="checkbox" aria-checked="${!!on}"></i>`;
  const row = (action, id, title, summary = '', extra = '', off = false) => `<button type="button" class="hgp-row${off ? ' off' : ''}" data-action="${action}" data-id="${e(id)}"${off ? ' disabled' : ''}><span class="hgp-text"><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
  const info = (title, summary) => `<div class="hgp-row hgp-info"><span class="hgp-text"><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span></div>`;
  const cat = title => `<h4 class="hgp-cat">${e(title)}</h4>`;
  const bar = (t, title, actions = '') => `<header class="hg-bar"><button type="button" class="hg-up" data-action="back" aria-label="${e(t('Navigate up'))}"><span aria-hidden="true">‹</span><img src="assets/hangouts.png" alt=""></button><div class="hg-title"><h2>${e(title)}</h2></div>${actions}</header>`;

  function settings(data, ui, t) {
    const p = prefs(data), page = ui.hgPage;
    if (page === 'settings') return [S('Settings'), row('hgp-limit', 'avatar', S('Profile photo'), S('Profile photo summary'))
      + row('hgp-page', 'status', S('Share your status'), S(p.statusDevice || p.statusInCall ? 'Status on' : 'Status off'))
      + cat(S('HANGOUT NOTIFICATIONS')) + row('hgp-toggle', 'chatOn', S('Notifications'), '', tick(p.chatOn)) + row('hgp-dialog', 'tone:chat', S('Sound'), toneOf(p.chatSound, 'notifications') || t('Silent'), '', !p.chatOn)
      + row('hgp-toggle', 'chatVibrate', S('Vibrate'), '', tick(p.chatVibrate), !p.chatOn) + row('hgp-toggle', 'chatInvites', S('Invites notify'), S('Invites notify summary'), tick(p.chatInvites), !p.chatOn)
      + cat(S('VIDEO CALLS')) + row('hgp-dialog', 'tone:video', S('Sound'), toneOf(p.videoSound, 'ringtones') || t('Silent')) + row('hgp-toggle', 'videoVibrate', S('Vibrate'), '', tick(p.videoVibrate))
      + cat(S('HOW OTHERS GET IN TOUCH WITH YOU')) + row('hgp-page', 'acl', S('Customize invites'), S('Customize invites summary'))
      + cat(S('ACCOUNT')) + row('hgp-profile', '', S('Google+ profile')) + row('hgp-page', 'blocked', S('Blocked people')) + row('hgp-limit', 'signout', S('Sign out'))
      + cat(S('Improve Hangouts category')) + row('hgp-toggle', 'improve', S('Improve Hangouts'), S('Improve Hangouts summary'), tick(p.improve))
      + cat(S('General')) + row('hgp-page', 'sms', S('SMS')) + row('hgp-page', 'about', S('About Google+ Hangouts'))];
    if (page === 'status') return [S('Share your status'), row('hgp-limit', 'mood', S('Set your mood'), S('Set your mood summary')) + row('hgp-toggle', 'statusDevice', S('Device'), S('Device summary'), tick(p.statusDevice)) + row('hgp-toggle', 'statusInCall', S('In call'), S('In call summary'), tick(p.statusInCall))];
    if (page === 'acl') return [S('Customize invites'), cat(S('EVERYONE ELSE')) + row('hgp-dialog', 'acl', S('acl.public'), S(`acl.${p.acl}`))];
    if (page === 'sms') return [S('SMS'), cat(S('SMS General')) + row('hgp-sms-app', '', S('SMS Enabled'), S('SMS Enabled summary')) + info(S('Account to show SMS in'), ACCOUNT)
      + cat(S('SMS Notifications category')) + row('hgp-toggle', 'smsOn', S('SMS notifications'), '', tick(p.smsOn)) + row('hgp-dialog', 'tone:sms', S('SMS sound'), toneOf(p.smsSound, 'notifications') || t('Silent'), '', !p.smsOn) + row('hgp-toggle', 'smsVibrate', S('SMS vibrate'), '', tick(p.smsVibrate), !p.smsOn)
      + cat(S('Advanced')) + row('hgp-toggle', 'groupMms', S('Group messaging'), S('Group messaging summary'), tick(p.groupMms)) + row('hgp-toggle', 'deleteOld', S('Delete old messages'), S('Delete old messages summary'), tick(p.deleteOld))
      + row('hgp-toggle', 'delivery', S('Delivery reports'), S('Delivery reports summary'), tick(p.delivery)) + row('hgp-toggle', 'autoMms', S('Auto retrieve MMS'), S('Auto retrieve MMS summary'), tick(p.autoMms))
      + row('hgp-toggle', 'roamingMms', S('Roaming auto-retrieve'), S('Roaming auto-retrieve summary'), tick(p.roamingMms), !p.autoMms) + row('hgp-apn', '', S('Access point names'))];
    if (page === 'about') return [S('About Google+ Hangouts'), cat(S('About')) + info(S('Hangouts'), '') + info(S('Build version'), BUILD)];
    return null;
  }
  function options(data, ui, t) {
    const key = String(ui.thread), person = who(data, key), on = !conv(data, key).quiet, many = isGroup(key);
    const option = (action, id, title, img, extra = '') => `<button type="button" class="hgp-option" data-action="${action}" data-id="${e(id)}"><img class="hgp-icon" src="assets/hg-${img}.png" alt=""><span class="hgp-text"><b>${e(title)}</b></span>${extra}</button>`;
    const people = many ? person.people : [contact(data, key) || person];
    const rows = option('hgp-mute', '', S('Conversation notifications'), 'ic_unmute_gray', tick(on)) + (many ? option('mms-delete-thread', '', S('Delete'), 'ic_delete_gray') : '');
    const list = people.map(p => `<div class="hgp-person"><img class="hgp-avatar" src="${AVATAR}" alt=""><span class="hgp-text"><b>${e(p.name)}</b><small>${e(p.phone || '')}</small></span></div>`).join('');
    return [S('People & options'), `<h4 class="hgp-head">${e(S('HANGOUT OPTIONS'))}</h4>${rows}<h4 class="hgp-head">${e(S('PEOPLE IN THIS HANGOUT'))}</h4>${list}`,
      `<button type="button" class="hg-ab-btn" data-action="hgp-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_light.png" alt=""></button>`];
  }
  function addPeople(data, ui, t) {
    const key = String(ui.thread), have = isGroup(key) ? (group(data, key)?.members || []).map(String) : [key];
    const chosen = ui.hgAdd || [], q = String(ui.hgAddQuery || '').toLocaleLowerCase();
    const chips = [...have.map(id => contact(data, id)).filter(Boolean).map(p => `<span class="hgp-chip fixed">${e(p.name)}</span>`), ...chosen.map(id => contact(data, id)).filter(Boolean).map(p => `<button type="button" class="hgp-chip" data-action="hgp-pick" data-id="${p.id}">${e(p.name)}</button>`)].join('');
    const people = [...data.contacts].filter(p => !have.includes(String(p.id)) && (!q || `${p.name} ${p.phone || ''}`.toLocaleLowerCase().includes(q))).sort((a, b) => a.name.localeCompare(b.name));
    const list = people.map(p => `<button type="button" class="hgp-pick${chosen.includes(String(p.id)) ? ' on' : ''}" data-action="hgp-pick" data-id="${p.id}"><img class="hgp-avatar" src="${AVATAR}" alt=""><span class="hgp-text"><b>${e(p.name)}</b><small>${e(p.phone || '')} ${e(t('Mobile'))}</small></span></button>`).join('');
    return [S(ui.hgFork ? 'New group Hangout' : 'New group MMS'), `<div class="hgp-audience">${chips}<input class="hgp-audience-field" data-hgp-query value="${e(ui.hgAddQuery || '')}" autocomplete="off" aria-label="${e(t('Type a name, email, number, or circle'))}" placeholder="${e(t('Type a name, email, number, or circle'))}"></div><div class="hgp-people">${list}</div>`, '',
      `<div class="hgp-buttons"><button type="button" data-action="back">${e(S('Cancel'))}</button><i></i><button type="button" data-action="hgp-add-ok"${chosen.length ? '' : ' disabled'}>${e(S('OK'))}</button></div>`];
  }
  function render(data, ui, t) {
    const page = ui.hgPage;
    let title = '', body = '', actions = '', foot = '', cls = '';
    if (page === 'invites') { title = S('Invites'); body = `<p class="hgp-empty">${e(S('No invites'))}</p>`; }
    else if (page === 'blocked') {
      title = S('Blocked People');
      const people = blocked(data).map(id => contact(data, id)).filter(Boolean);
      body = people.length ? people.map(p => `<div class="hgp-blocked-row"><img class="hgp-avatar" src="${AVATAR}" alt=""><b>${e(p.name)}</b><i></i><button type="button" data-action="hgp-unblock" data-id="${p.id}">${e(S('Unblock'))}</button></div>`).join('')
        : `<div class="hgp-zero"><img src="assets/hg-ic_zero_blocked.png" alt=""><b>${e(S('No blocked people'))}</b></div>`;
    } else if (page === 'options') { [title, body, actions] = options(data, ui, t); cls = ' hgp-options'; }
    else if (page === 'add') { [title, body, actions, foot] = addPeople(data, ui, t); cls = ' hgp-add'; }
    else { const s = settings(data, ui, t); if (!s) return ''; [title, body] = s; cls = ' hgp-settings'; }
    return `<div class="app-view hg-app hgp-app${cls}">${bar(t, title, actions)}<div class="hgp-scroll">${body}</div>${foot}${dialog(data, ui, t)}</div>`;
  }
  function dialog(data, ui, t) {
    const d = ui.hgDialog; if (!d) return '';
    const p = prefs(data);
    const scrim = `<button type="button" class="hgp-scrim" data-action="hgp-close" aria-label="${e(S('Cancel'))}"></button>`;
    const box = (title, inner, buttons) => `${scrim}<div class="hgp-dialog" role="dialog"><h3>${e(title)}</h3>${inner}${buttons ? `<div class="hgp-dialog-buttons">${buttons}</div>` : ''}</div>`;
    const cancel = `<button type="button" data-action="hgp-close">${e(S('Cancel'))}</button>`;
    const choice = (action, i, label, on) => `<button type="button" class="hgp-choice${on ? ' on' : ''}" data-action="${action}" data-id="${i}" role="radio" aria-checked="${on}"><span>${e(label)}</span><i></i></button>`;
    if (d.startsWith('tone:')) {
      const which = d.slice(5), kind = which === 'video' ? 'ringtones' : 'notifications', names = tones(kind);
      const at = ui.hgTone ?? Math.max(0, names.indexOf(toneOf(p[`${which}Sound`], kind)));
      return box(S(which === 'sms' ? 'SMS sound' : 'Sound'), `<div class="hgp-list">${names.map((name, i) => choice('hgp-tone', i, i ? name : t('Silent'), at === i)).join('')}</div>`, cancel + `<button type="button" data-action="hgp-tone-ok">${e(S('OK'))}</button>`);
    }
    if (d === 'acl') return box(S('acl.public'), ['RING', 'INVITE'].map(v => choice('hgp-acl', v, S(`acl.${v}`), p.acl === v)).join(''), cancel);
    if (d === 'menu') {
      const item = (action, id, label) => `<button type="button" data-action="${action}" data-id="${id}">${e(label)}</button>`;
      return `<button type="button" class="hgp-scrim clear" data-action="hgp-close" aria-label="${e(S('Cancel'))}"></button><div class="hg-menu hgp-menu" role="menu">${isGroup(ui.thread) ? '' : item('hgp-fork', '', S('New group Hangout'))}${item('hgp-page', 'settings', S('Settings'))}${item('hgp-limit', 'help', S('Help'))}</div>`;
    }
    return '';
  }
  const set = (data, patch) => { data.hgPrefs = {...(data.hgPrefs || {}), ...patch}; };
  function handle(action, id, ctx) {
    const {data, ui} = ctx, key = String(ui.thread), p = prefs(data);
    const close = () => { window.SystemSounds?.stop(); ui.hgDialog = ''; ui.hgTone = undefined; };
    switch (action) {
      case 'hgp-open': ui.overlay = ''; ctx.renderOverlay?.(); ui.hgPage = id; ui.hgStack = []; ui.hgAdd = []; ui.hgAddQuery = ''; ui.hgFork = false; ctx.render(); return true;
      case 'hgp-page': close(); (ui.hgStack ||= []).push(ui.hgPage); ui.hgPage = id; ctx.render(); return true;
      case 'hgp-toggle': set(data, {[id]: !p[id]}); ctx.save(); ctx.render(); return true;
      case 'hgp-dialog': ui.hgDialog = id; ui.hgTone = undefined; ctx.render(); return true;
      case 'hgp-menu': ui.hgDialog = 'menu'; ctx.render(); return true;
      case 'hgp-close': close(); ctx.render(); return true;
      case 'hgp-tone': {
        ui.hgTone = Number(id) || 0; const kind = ui.hgDialog === 'tone:video' ? 'ringtones' : 'notifications';
        if (ui.hgTone) window.SystemSounds?.play(kind, tones(kind)[ui.hgTone]); else window.SystemSounds?.stop(); ctx.render(); return true;
      }
      case 'hgp-tone-ok': {
        const which = ui.hgDialog.slice(5), kind = which === 'video' ? 'ringtones' : 'notifications';
        if (ui.hgTone !== undefined) { set(data, {[`${which}Sound`]: tones(kind)[ui.hgTone] || ''}); ctx.save(); }
        close(); ctx.render(); return true;
      }
      case 'hgp-acl': set(data, {acl: id}); ctx.save(); close(); ctx.render(); return true;
      case 'hgp-mute': data.hgConv = {...(data.hgConv || {}), [key]: {...conv(data, key), quiet: !conv(data, key).quiet}}; ctx.save(); ctx.render(); return true;
      case 'hgp-unblock': data.hgBlocked = blocked(data).filter(x => x !== Number(id)); ctx.save(); ctx.render(); return true;
      case 'hgp-fork': close(); (ui.hgStack ||= []).push(ui.hgPage); ui.hgPage = 'add'; ui.hgAdd = []; ui.hgAddQuery = ''; ui.hgFork = true; ctx.render(); return true;
      case 'hgp-pick': { const chosen = ui.hgAdd || []; ui.hgAdd = chosen.includes(id) ? chosen.filter(x => x !== id) : [...chosen, id]; ctx.render(); return true; }
      case 'hgp-add-ok': {
        const chosen = (ui.hgAdd || []).map(Number); if (!chosen.length) return true;
        const base = isGroup(key) ? group(data, key).members : [Number(key)];
        const next = `g${(data.hgNextGroup = (data.hgNextGroup || 0) + 1)}`;
        data.hgGroups = {...(data.hgGroups || {}), [next]: {members: [...new Set([...base, ...chosen])]}};
        ui.hgPage = ''; ui.hgStack = []; ui.hgAdd = []; ui.hgFork = false; ctx.save(); ctx.openThread(next); return true;
      }
      case 'hgp-sms-app': ctx.smsApp(); return true;
      case 'hgp-apn': ctx.openApn(); return true;
      case 'hgp-profile': ctx.openApp('google-plus'); return true;
      case 'hgp-limit': ctx.toast('This feature is not part of the simulator.'); return true;
      default: return false;
    }
  }
  function back(ui) {
    if (ui.hgDialog) { window.SystemSounds?.stop(); ui.hgDialog = ''; ui.hgTone = undefined; return; }
    ui.hgPage = ui.hgStack?.pop() || '';
    if (!ui.hgPage) { ui.hgAdd = []; ui.hgFork = false; }
  }
  function mount(root, ui, render) {
    const field = root.querySelector('[data-hgp-query]');
    if (field) field.addEventListener('input', () => { ui.hgAddQuery = field.value; const at = field.selectionStart; render(); const again = root.ownerDocument.querySelector('[data-hgp-query]'); again?.focus(); again?.setSelectionRange(at, at); });
  }
  window.HangoutsPrefs = {render, handle, back, mount, who, isGroup, notifies, prefs, S};
})();
