/* Hangouts 2.5 (Hangouts.apk of LMY48Y) beyond its chats: Settings, Invites, Blocked people, People & options and Add
   people, plus Google Messenger 1.1's People & options (PrebuiltBugle). From the APKs:
   - Settings: the account (babel_settings.xml) with Profile photo, Share your status (rich_status_settings.xml: Device,
     In call), Device Presence, Show my last seen, HANGOUT NOTIFICATIONS (Hangouts messages & invites and Video calls,
     each with Notifications, Sound and Vibrate as 6.0.1's Hangouts 4.1 lays them out), HOW OTHERS GET IN TOUCH WITH YOU
     (chat_acl_settings.xml: phone, email and Everyone Else, each Can contact you directly / Can send you an invite /
     Can't contact you), ACCOUNT (Google+ profile, Hidden contacts, Sign out) and Improve Hangouts. The settings code
     drops Join Google+ for an account with a Google+ profile, the Google Voice category without a Voice number and
     Confirm phone number without the server's verification flag; the business preview rows are left out with it.
   - Invites (no_invites_text) and Blocked people (blocked_people_fragment.xml: ic_zero_blocked over "No blocked
     people", blocked_people_list_item_view.xml rows with the Unblock button).
   - People & options (ConversationParticipantsFragment.onCreateView): HANGOUT OPTIONS with Hangout name / Rename for a
     group, Notifications (notification level 30 with the box ticked, 10 without), Chat message sound and Call ringtone
     (enabled with notifications), Block %s / Unblock %s for one person or Leave for a group (realtimechat_block_user_*,
     realtimechat_leave_conversation_*), PEOPLE IN THIS HANGOUT, and Add People under a group; its menu
     (conversation_participants_fragment_menu.xml with onPrepareOptionsMenu): New group conversation for one person, Add
     people and New Hangout with this group for a group, Settings.
   - Add people (uber_edit_audience_fragment.xml): the audience over the people list, the disclaimer when people join an
     existing group, Cancel and OK. From a one-person chat it starts a group Hangout with them.
   - Messenger's People & options (people_and_options_fragment.xml, PeopleOptionsItemView): Notifications, Sound and
     Vibrate, Block %s / Unblock %s (block_confirmation_*: the conversation is archived and stays silent), then "People
     in this conversation".
   What they change here: a muted or blocked conversation, Hangouts notifications off or snoozed post no notification;
   a blocked person's Hangouts messages do not arrive; group Hangouts keep their members and name. Profile photo and
   Sign out stay account-service limits. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const lang = () => String(globalThis.document?.documentElement?.lang || '').slice(0, 2);
  const pick = (group, prefix) => key => { const row = window.StockStrings?.[group]?.[prefix + key]; return row ? AndroidStrings.pick(row, lang(), row.en || key) : key; };
  const S = pick('hangouts', 'hp.'), M = pick('messenger', 'mo.');
  const plain = html => String(html).replace(/<[^>]+>/g, '');
  const ACCOUNT = 'nexus6.demo@gmail.com';
  // babel_settings.xml's defaults (share_device_presence false, last_seen true, improve_hangouts true; notifications and
  // vibrate on) and chat_acl_settings' INVITE.
  const DEFAULTS = {chatOn: true, chatVibrate: true, videoOn: true, videoVibrate: true, presence: false, lastSeen: true, improve: true, statusDevice: false, statusInCall: false, acl: {phone: 'INVITE', email: 'INVITE', public: 'INVITE'}};
  const ACL = ['RING', 'INVITE', 'BLOCKED'];
  const prefs = data => ({...DEFAULTS, ...(data.hgPrefs || {}), acl: {...DEFAULTS.acl, ...(data.hgPrefs?.acl || {})}});
  const conv = (data, key) => data.hgConv?.[key] || {};
  const blocked = data => data.hgBlocked || [];
  const isGroup = key => /^g\d+$/.test(String(key));
  const group = (data, key) => data.hgGroups?.[key];
  const contact = (data, id) => data.contacts.find(p => String(p.id) === String(id));
  const members = (data, key) => (group(data, key)?.members || []).map(id => contact(data, id)).filter(Boolean);
  // A conversation's people and title: a group's name, or its members' names.
  function who(data, key) {
    if (!isGroup(key)) return ICSMessaging.identity(key, data.contacts);
    const people = members(data, key);
    return {name: group(data, key)?.name || people.map(p => p.name).join(', '), group: true, people};
  }
  // The notification sounds and ringtones of the image (SystemSounds); '' is Silent.
  const tones = kind => ['', ...Object.values(window.SystemSounds?.SOUNDS?.[kind] || {}).map(([title]) => title)];
  const defaultTone = kind => { const key = window.SystemSounds?.DEFAULTS?.[kind]; return window.SystemSounds?.SOUNDS?.[kind]?.[key]?.[0] || ''; };
  const toneOf = (value, kind) => value === undefined ? defaultTone(kind) : value;
  // Whether an incoming Hangouts message arrives at all (not from a blocked person) and whether it notifies.
  const receives = (data, key) => !blocked(data).includes(Number(key));
  const notifies = (data, key, now = Date.now()) => receives(data, key) && prefs(data).chatOn && !(data.hgSnooze > now) && !conv(data, key).quiet;

  const tick = on => `<i class="hgp-check${on ? ' on' : ''}" role="checkbox" aria-checked="${!!on}"></i>`;
  const row = (action, id, title, summary = '', extra = '', off = false) => `<button type="button" class="hgp-row${off ? ' off' : ''}" data-action="${action}" data-id="${e(id)}"${off ? ' disabled' : ''}><span class="hgp-text"><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
  const cat = title => `<h4 class="hgp-cat">${e(title)}</h4>`;
  const avatar = (person, cls) => window.LPDialer ? LPDialer.letterTile(person, cls) : `<img class="${cls}" src="assets/hg-default_avatar.png" alt="">`;
  const bar = (t, title, actions = '') => `<header class="hgl-bar hgp-bar"><button type="button" class="hgl-btn" data-action="back" aria-label="${e(t('Navigate up'))}"><img src="assets/bg-ic_arrow_back_light.png" alt=""></button><h2>${e(title)}</h2>${actions}</header>`;

  function settings(data, ui, t) {
    const p = prefs(data), page = ui.hgPage, acl = key => S(`acl.${p.acl[key]}`);
    if (page === 'settings') return [S('Settings'), row('hgp-page', 'account', ACCOUNT)];
    if (page === 'account') return [ACCOUNT, row('hgp-limit', 'avatar', S('Profile photo'), S('Profile photo summary'))
      + row('hgp-page', 'status', S('Share your status'), S(p.statusDevice || p.statusInCall ? 'Status on' : 'Status off'))
      + row('hgp-toggle', 'presence', S('Device Presence'), S(p.presence ? 'Presence on' : 'Presence off'), tick(p.presence))
      + row('hgp-toggle', 'lastSeen', S('Last seen'), S('Last seen summary'), tick(p.lastSeen))
      + cat(S('HANGOUT NOTIFICATIONS')) + row('hgp-page', 'notify:chat', S('Messages & invites')) + row('hgp-page', 'notify:video', S('Video calls'))
      + cat(S('HOW OTHERS GET IN TOUCH WITH YOU')) + row('hgp-page', 'acl', S('Customize invites'), S('Customize invites summary'))
      + cat(S('ACCOUNT')) + row('hgp-profile', '', S('Google+ profile')) + row('hgp-page', 'hidden', S('Hidden contacts')) + row('hgp-limit', 'signout', S('Sign out'))
      + cat(S('Improve Hangouts category')) + row('hgp-toggle', 'improve', S('Improve Hangouts'), S('Improve Hangouts summary'), tick(p.improve))];
    if (page === 'status') return [S('Share your status'), row('hgp-toggle', 'statusDevice', S('Device'), S('Device summary'), tick(p.statusDevice)) + row('hgp-toggle', 'statusInCall', S('In call'), S('In call summary'), tick(p.statusInCall))];
    if (page.startsWith('notify:')) {
      const k = page.slice(7), on = p[`${k}On`], kind = k === 'chat' ? 'notifications' : 'ringtones', tone = toneOf(p[`${k}Sound`], kind);
      return [S(k === 'chat' ? 'Messages & invites' : 'Video calls'), row('hgp-toggle', `${k}On`, S('Notifications'), '', tick(on)) + row('hgp-dialog', `tone:${k}`, S('Sound'), tone || t('Silent'), '', !on) + row('hgp-toggle', `${k}Vibrate`, S('Vibrate'), '', tick(p[`${k}Vibrate`]), !on)];
    }
    if (page === 'acl') return [S('Customize invites'), ['phone', 'email', 'public'].map(key => row('hgp-dialog', `acl:${key}`, S(`acl.${key}`), acl(key))).join('')];
    if (page === 'hidden') return [S('Hidden contacts'), ''];
    return null;
  }
  // People & options of the open conversation.
  function options(data, ui, t) {
    const key = String(ui.thread), person = who(data, key), c = conv(data, key), on = !c.quiet, many = isGroup(key);
    const option = (action, id, title, subtitle, img, extra = '', off = false) => `<button type="button" class="hgp-option${off ? ' off' : ''}" data-action="${action}" data-id="${e(id)}"${off ? ' disabled' : ''}><img class="hgp-icon" src="assets/hg-${img}.png" alt=""><span class="hgp-text"><b>${e(title)}</b>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</span>${extra}</button>`;
    const isBlocked = !many && blocked(data).includes(Number(key)), name = group(data, key)?.name || '';
    const people = many ? person.people : [contact(data, key) || person];
    const last = many ? option('hgp-dialog', 'leave', S('Leave'), '', 'ic_ignore_gray')
      : !Number.isFinite(Number(key)) ? '' : isBlocked ? option('hgp-unblock', '', AndroidStrings.format(S('Unblock %s'), person.name), '', 'ic_ignore_gray')
      : option('hgp-dialog', 'block', AndroidStrings.format(S('Block %s'), person.name), '', 'ic_ignore_gray');
    const rows = (many ? option('hgp-dialog', 'rename', S(name ? 'Hangout name' : 'Rename'), name, 'ic_edit_gray') : '')
      + option('hgp-mute', '', S('Conversation notifications'), '', 'ic_unmute_gray', tick(on))
      + option('hgp-dialog', 'tone:conv', S('Chat message sound'), toneOf(c.sound, 'notifications') || t('Silent'), 'ic_speaker_on_gray', '', !on)
      + option('hgp-dialog', 'tone:call', S('Call ringtone'), toneOf(c.ring, 'ringtones') || t('Silent'), 'ic_speaker_on_gray', '', !on) + last;
    const list = people.map(p => `<div class="hgp-person">${avatar(p, 'hgp-avatar')}<span class="hgp-text"><b>${e(p.name)}</b></span></div>`).join('');
    // Add people (a group) or New group conversation (one person) as the always-shown action, then the overflow.
    const actions = `<button type="button" class="hgl-btn hgl-white" data-action="hgp-page" data-id="add" aria-label="${e(S(many ? 'Add people' : 'New group conversation'))}"><img src="assets/hg-ic_person_add_24dp.png" alt=""></button><button type="button" class="hgl-btn hgl-white" data-action="hgp-menu" aria-label="${e(t('More options'))}"><img src="assets/gd-ic_overflow_menu.png" alt=""></button>`;
    return [S('People & options'), `<h4 class="hgp-head">${e(S('HANGOUT OPTIONS'))}</h4>${rows}<h4 class="hgp-head">${e(S('PEOPLE IN THIS HANGOUT'))}</h4>${list}${many ? option('hgp-page', 'add', S('Add People'), '', 'ic_person_add_24dp') : ''}`, actions];
  }
  // Add people: from one person a new group with them, from a group more members for it.
  function addPeople(data, ui, t) {
    const key = String(ui.thread), many = isGroup(key) && !ui.hgFork, have = isGroup(key) ? (group(data, key)?.members || []).map(String) : [key];
    const chosen = ui.hgAdd || [], q = String(ui.hgAddQuery || '').toLocaleLowerCase();
    const fixed = (many ? [] : have).map(id => contact(data, id)).filter(Boolean);
    const chips = [...fixed.map(p => `<span class="hgp-chip fixed">${e(p.name)}</span>`), ...chosen.map(id => contact(data, id)).filter(Boolean).map(p => `<button type="button" class="hgp-chip" data-action="hgp-pick" data-id="${p.id}">${e(p.name)}</button>`)].join('');
    const people = [...data.contacts].filter(p => !have.includes(String(p.id)) && !blocked(data).includes(p.id) && (!q || `${p.name} ${p.email || ''} ${p.phone || ''}`.toLocaleLowerCase().includes(q))).sort((a, b) => a.name.localeCompare(b.name));
    const list = people.map(p => `<button type="button" class="hgp-pick${chosen.includes(String(p.id)) ? ' on' : ''}" data-action="hgp-pick" data-id="${p.id}">${avatar(p, 'hgp-avatar')}<span class="hgp-text"><b>${e(p.name)}</b><small>${e(p.email || p.phone || '')}</small></span></button>`).join('');
    return [S('Add people'), `<div class="hgp-audience">${chips}<input class="hgp-audience-field" data-hgp-query value="${e(ui.hgAddQuery || '')}" autocomplete="off" aria-label="${e(t('Type a name, email, number, or circle'))}" placeholder="${e(t('Type a name, email, number, or circle'))}"></div><div class="hgp-people">${list}</div>`, '', `<div class="hgp-buttons">${many ? `<p>${e(S('Add people disclaimer'))}</p>` : ''}<div><button type="button" data-action="back">${e(S('Cancel'))}</button><i></i><button type="button" data-action="hgp-add-ok"${chosen.length ? '' : ' disabled'}>${e(S('OK'))}</button></div></div>`];
  }
  function render(data, ui, t) {
    const page = ui.hgPage;
    let title = '', body = '', actions = '', foot = '', cls = '';
    if (page === 'invites') { title = S('Invites'); body = `<p class="hgp-empty">${e(S('No invites'))}</p>`; }
    else if (page === 'blocked') {
      title = S('Blocked people'); cls = ' hgp-blocked';
      const people = blocked(data).map(id => contact(data, id)).filter(Boolean);
      body = people.length ? people.map(p => `<div class="hgp-blocked-row">${avatar(p, 'hgp-avatar')}<b>${e(p.name)}</b><i></i><button type="button" data-action="hgp-unblock" data-id="${p.id}">${e(S('Unblock'))}</button></div>`).join('')
        : `<div class="hgp-zero"><img src="assets/hg-ic_zero_blocked.png" alt=""><b>${e(S('No blocked people'))}</b></div>`;
    } else if (page === 'options') [title, body, actions] = options(data, ui, t);
    else if (page === 'add') { [title, body, actions, foot] = addPeople(data, ui, t); cls = ' hgp-add'; }
    else { const s = settings(data, ui, t); if (!s) return ''; [title, body] = s; cls = ' hgp-settings'; }
    return `<div class="app-view hgl-app hgp-app${cls}">${bar(t, title, actions)}<div class="hgp-scroll">${body}</div>${foot}${dialog(data, ui, t)}</div>`;
  }
  function dialog(data, ui, t) {
    const d = ui.hgDialog; if (!d) return '';
    const p = prefs(data), key = String(ui.thread);
    const scrim = `<button type="button" class="hgp-scrim" data-action="hgp-close" aria-label="${e(S('Cancel'))}"></button>`;
    const box = (title, inner, buttons) => `${scrim}<div class="hgp-dialog" role="dialog">${title ? `<h3>${e(title)}</h3>` : ''}${inner}<div class="hgp-dialog-buttons">${buttons}</div></div>`;
    const cancel = `<button type="button" data-action="hgp-close">${e(S('Cancel'))}</button>`;
    const choice = (action, i, label, on) => `<button type="button" class="hgp-choice${on ? ' on' : ''}" data-action="${action}" data-id="${i}" role="radio" aria-checked="${on}"><span>${e(label)}</span><i></i></button>`;
    if (d.startsWith('tone:')) {
      const which = d.slice(5), kind = ['video', 'call'].includes(which) ? 'ringtones' : 'notifications';
      const current = which === 'conv' ? conv(data, key).sound : which === 'call' ? conv(data, key).ring : p[`${which}Sound`];
      const names = tones(kind), at = ui.hgTone ?? Math.max(0, names.indexOf(toneOf(current, kind)));
      // RingtonePreference hands the picker its own title.
      const title = which === 'conv' ? S('Chat message sound') : which === 'call' ? S('Call ringtone') : S('Sound');
      return box(title, `<div class="hgp-list">${names.map((name, i) => choice('hgp-tone', i, i ? name : t('Silent'), at === i)).join('')}</div>`, cancel + `<button type="button" data-action="hgp-tone-ok">${e(S('OK'))}</button>`);
    }
    if (d.startsWith('acl:')) { const k = d.slice(4); return box(S(`acl.${k}`), ACL.map(v => choice('hgp-acl', v, S(`acl.${v}`), p.acl[k] === v)).join(''), cancel); }
    if (d === 'block') return box(AndroidStrings.format(S('Block title'), who(data, key).name), `<p class="hgp-msg">${e(plain(S('Block text')))}</p>`, cancel + `<button type="button" data-action="hgp-block">${e(S('Block button'))}</button>`);
    if (d === 'leave') return box(S('Leave Hangout'), `<p class="hgp-msg">${e(S('Leave text'))}</p>`, `<button type="button" data-action="hgp-close">${e(S('Stay'))}</button><button type="button" data-action="hgp-leave">${e(S('Leave button'))}</button>`);
    if (d === 'rename') return box(S('Rename Hangout'), `<input class="hgp-edit" data-hgp-edit maxlength="100" value="${e(group(data, key)?.name || '')}">`, cancel + `<button type="button" data-action="hgp-rename">${e(S('OK'))}</button>`);
    if (d === 'menu') {
      const many = isGroup(key), item = (action, id, label) => `<button type="button" data-action="${action}" data-id="${id}">${e(label)}</button>`;
      return `<button type="button" class="hgp-scrim clear" data-action="hgp-close" aria-label="${e(S('Cancel'))}"></button><div class="lp-popup-menu hgp-menu" role="menu">${many ? item('hgp-fork', '', S('New Hangout with this group')) : ''}${item('hgp-page', 'settings', S('Settings menu'))}</div>`;
    }
    return '';
  }
  const set = (data, patch) => { data.hgPrefs = {...(data.hgPrefs || {}), ...patch}; };
  const setConv = (data, key, patch) => { data.hgConv = {...(data.hgConv || {}), [key]: {...conv(data, key), ...patch}}; };
  function handle(action, id, ctx) {
    const {data, ui} = ctx, key = String(ui.thread), p = prefs(data);
    const close = () => { window.SystemSounds?.stop(); ui.hgDialog = ''; ui.hgTone = undefined; };
    switch (action) {
      case 'hgp-open': ui.overlay = ''; ctx.renderOverlay?.(); ui.hgPage = id; ui.hgStack = []; ui.hgAdd = []; ui.hgAddQuery = ''; ui.hgFork = false; ctx.render(); return true;
      case 'hgp-page': if (id === 'add') { ui.hgAdd = []; ui.hgAddQuery = ''; ui.hgFork = false; } ui.hgDialog = ''; (ui.hgStack ||= []).push(ui.hgPage); ui.hgPage = id; ctx.render(); return true;
      case 'hgp-toggle': { const v = p[id]; set(data, {[id]: !v}); ctx.save(); ctx.render(); return true; }
      case 'hgp-dialog': ui.hgDialog = id; ui.hgTone = undefined; ctx.render(); ctx.root.querySelector('[data-hgp-edit]')?.focus(); return true;
      case 'hgp-menu': ui.hgDialog = 'menu'; ctx.render(); return true;
      case 'hgp-close': close(); ctx.render(); return true;
      case 'hgp-tone': {
        ui.hgTone = Number(id) || 0; const kind = ['tone:video', 'tone:call'].includes(ui.hgDialog) ? 'ringtones' : 'notifications';
        if (ui.hgTone) window.SystemSounds?.play(kind, tones(kind)[ui.hgTone]); else window.SystemSounds?.stop(); ctx.render(); return true;
      }
      case 'hgp-tone-ok': {
        const which = ui.hgDialog.slice(5), kind = ['video', 'call'].includes(which) ? 'ringtones' : 'notifications';
        if (ui.hgTone !== undefined) { const name = tones(kind)[ui.hgTone] || ''; if (which === 'conv') setConv(data, key, {sound: name}); else if (which === 'call') setConv(data, key, {ring: name}); else set(data, {[`${which}Sound`]: name}); ctx.save(); }
        close(); ctx.render(); return true;
      }
      case 'hgp-acl': set(data, {acl: {...p.acl, [ui.hgDialog.slice(4)]: id}}); ctx.save(); close(); ctx.render(); return true;
      case 'hgp-mute': setConv(data, key, {quiet: !conv(data, key).quiet}); ctx.save(); ctx.render(); return true;
      case 'hgp-block': data.hgBlocked = [...new Set([...blocked(data), Number(key)])]; ctx.save(); close(); ctx.render(); return true;
      case 'hgp-unblock': {
        const target = Number(id || key), person = contact(data, target);
        data.hgBlocked = blocked(data).filter(x => x !== target); ctx.save(); ctx.render();
        if (ui.hgPage === 'options' && person) ctx.toast(AndroidStrings.format(S('Unblocked %s'), person.name)); return true;
      }
      case 'hgp-leave': {
        data.messages = data.messages.filter(m => !(String(m.contact) === key && ICSMessaging.channelOf(m) === 'hangouts'));
        if (data.messageDrafts) delete data.messageDrafts[`hg:${key}`];
        const groups = {...(data.hgGroups || {})}; delete groups[key]; data.hgGroups = groups;
        close(); ui.hgPage = ''; ui.hgStack = []; ui.sub = ''; ui.mmsListMode = ''; ctx.save(); ctx.render(); return true;
      }
      case 'hgp-rename': { const name = ctx.root.querySelector('[data-hgp-edit]')?.value.trim() || ''; data.hgGroups = {...data.hgGroups, [key]: {...group(data, key), name}}; ctx.save(); close(); ctx.render(); return true; }
      case 'hgp-fork': close(); (ui.hgStack ||= []).push(ui.hgPage); ui.hgPage = 'add'; ui.hgAdd = []; ui.hgAddQuery = ''; ui.hgFork = true; ctx.render(); return true;
      case 'hgp-pick': { const chosen = ui.hgAdd || []; ui.hgAdd = chosen.includes(id) ? chosen.filter(x => x !== id) : [...chosen, id]; ctx.render(); return true; }
      case 'hgp-add-ok': {
        const chosen = (ui.hgAdd || []).map(Number); if (!chosen.length) return true;
        if (isGroup(key) && !ui.hgFork) { const g = group(data, key); data.hgGroups = {...data.hgGroups, [key]: {...g, members: [...new Set([...g.members, ...chosen])]}}; ctx.save(); ui.hgPage = ui.hgStack?.pop() || ''; ctx.render(); return true; }
        const base = isGroup(key) ? group(data, key).members : [Number(key)];
        const id2 = `g${(data.hgNextGroup = (data.hgNextGroup || 0) + 1)}`;
        data.hgGroups = {...(data.hgGroups || {}), [id2]: {members: [...new Set([...base, ...chosen])], name: ''}};
        ui.hgPage = ''; ui.hgStack = []; ui.hgAdd = []; ui.hgFork = false; ctx.save(); ctx.openThread(id2); return true;
      }
      case 'hgp-profile': ctx.openApp('google-plus'); return true;
      case 'hgp-limit': ctx.toast('This feature is not part of the simulator.'); return true;
      default: return false;
    }
  }
  // Back: a dialog, then the page this one was opened from, then out to the list or the conversation.
  function back(ui) {
    if (ui.hgDialog) { window.SystemSounds?.stop(); ui.hgDialog = ''; ui.hgTone = undefined; return; }
    ui.hgPage = ui.hgStack?.pop() || '';
    if (!ui.hgPage) { ui.hgAdd = []; ui.hgFork = false; }
  }
  // The audience field filters the people list as it is typed.
  function mount(root, ui, render) {
    const field = root.querySelector('[data-hgp-query]');
    if (field) field.addEventListener('input', () => { ui.hgAddQuery = field.value; const at = field.selectionStart; render(); const again = root.ownerDocument.querySelector('[data-hgp-query]'); again?.focus(); again?.setSelectionRange(at, at); });
  }

  /* Messenger: People & options of an SMS conversation. Blocking archives the conversation and keeps it silent;
     unblocking brings it back (UpdateDestinationBlockedAction). */
  const mconv = (data, key) => data.lpmConv?.[key] || {};
  const mBlocked = (data, key) => (data.lpmBlocked || []).includes(String(key));
  const mNotifies = (data, key) => !mBlocked(data, key) && mconv(data, key).off !== true;
  const sw = on => `<i class="mpo-switch${on ? ' on' : ''}" role="switch" aria-checked="${!!on}"></i>`;
  function renderMessenger(data, ui, t) {
    const key = String(ui.thread), person = ICSMessaging.identity(key, data.contacts), c = mconv(data, key), on = c.off !== true;
    const item = (action, title, subtitle, extra = '', off = false) => `<button type="button" class="mpo-row${off ? ' off' : ''}" data-action="${action}"${off ? ' disabled' : ''}><span class="mpo-text"><b>${e(title)}</b>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</span>${extra}</button>`;
    const isBlocked = mBlocked(data, key);
    const body = item('mpo-toggle', M('Notifications'), '', sw(on)) + item('mpo-dialog', M('Sound'), toneOf(c.sound, 'notifications') || M('Silent'), '', !on) + item('mpo-vibrate', M('Vibrate'), '', sw(c.vibrate !== false), !on)
      + item(isBlocked ? 'mpo-unblock' : 'mpo-block', AndroidStrings.format(M(isBlocked ? 'Unblock %s' : 'Block %s'), person.name), '')
      + `<div class="mpo-head"><i></i><span>${e(M('People in this conversation'))}</span></div><div class="mpo-person">${window.LPDialer ? LPDialer.letterTile(person, 'mpo-avatar') : ''}<span class="mpo-text"><b>${e(person.name)}</b><small>${e(person.phone || '')}</small></span></div>`;
    let d = '';
    if (ui.mpoDialog === 'tone') { const names = tones('notifications'), at = ui.hgTone ?? Math.max(0, names.indexOf(toneOf(c.sound, 'notifications'))); d = `<button type="button" class="mpo-scrim" data-action="mpo-close" aria-label="${e(M('Cancel'))}"></button><div class="mpo-dialog" role="dialog"><h3>${e(M('Sound'))}</h3><div class="mpo-tones">${names.map((name, i) => `<button type="button" class="mpo-choice${at === i ? ' on' : ''}" data-action="mpo-tone" data-id="${i}" role="radio" aria-checked="${at === i}"><span>${e(i ? name : M('Silent'))}</span><i></i></button>`).join('')}</div><div class="mpo-buttons"><button type="button" data-action="mpo-close">${e(M('Cancel'))}</button><button type="button" data-action="mpo-tone-ok">${e(t('OK'))}</button></div></div>`; }
    if (ui.mpoDialog === 'block') d = `<button type="button" class="mpo-scrim" data-action="mpo-close" aria-label="${e(M('Cancel'))}"></button><div class="mpo-dialog" role="dialog"><h3>${e(AndroidStrings.format(M('Block %s?'), person.name))}</h3><p class="mpo-msg">${e(M('Block message'))}</p><div class="mpo-buttons"><button type="button" data-action="mpo-close">${e(M('Cancel'))}</button><button type="button" data-action="mpo-block-ok">${e(M('Block'))}</button></div></div>`;
    return `<div class="app-view lpm-app mpo-app"><header class="lpm-toolbar">${`<button type="button" class="lpm-tool" data-action="back" aria-label="${e(t('Navigate up'))}"><img src="assets/bg-ic_arrow_back_light.png" alt=""></button>`}<h2>${e(M('People & options'))}</h2></header><div class="mpo-list">${body}</div>${d}</div>`;
  }
  function handleMessenger(action, id, ctx) {
    const {data, ui} = ctx, key = String(ui.thread), set2 = patch => { data.lpmConv = {...(data.lpmConv || {}), [key]: {...mconv(data, key), ...patch}}; ctx.save(); };
    const close = () => { window.SystemSounds?.stop(); ui.mpoDialog = ''; ui.hgTone = undefined; };
    switch (action) {
      case 'mpo-open': ui.overlay = ''; ctx.renderOverlay?.(); ui.lpmPage = 'options'; ctx.render(); return true;
      case 'mpo-toggle': set2({off: mconv(data, key).off !== true}); ctx.render(); return true;
      case 'mpo-vibrate': set2({vibrate: mconv(data, key).vibrate === false}); ctx.render(); return true;
      case 'mpo-dialog': ui.mpoDialog = 'tone'; ui.hgTone = undefined; ctx.render(); return true;
      case 'mpo-tone': ui.hgTone = Number(id) || 0; if (ui.hgTone) window.SystemSounds?.play('notifications', tones('notifications')[ui.hgTone]); else window.SystemSounds?.stop(); ctx.render(); return true;
      case 'mpo-tone-ok': if (ui.hgTone !== undefined) set2({sound: tones('notifications')[ui.hgTone] || ''}); close(); ctx.render(); return true;
      case 'mpo-close': close(); ctx.render(); return true;
      case 'mpo-block': ui.mpoDialog = 'block'; ctx.render(); return true;
      case 'mpo-block-ok': data.lpmBlocked = [...new Set([...(data.lpmBlocked || []), key])]; ctx.save(); close(); ui.lpmPage = ''; ui.sub = ''; ui.mmsListMode = ''; ctx.render(); ctx.toast(M('Blocked toast')); return true;
      case 'mpo-unblock': data.lpmBlocked = (data.lpmBlocked || []).filter(x => x !== key); ctx.save(); ctx.render(); ctx.toast(AndroidStrings.format(M('%s unblocked'), ICSMessaging.identity(key, data.contacts).name)); return true;
      default: return false;
    }
  }
  function backMessenger(ui) { if (ui.mpoDialog) { window.SystemSounds?.stop(); ui.mpoDialog = ''; ui.hgTone = undefined; return; } ui.lpmPage = ''; }

  window.HangoutsPrefs = {render, handle, back, mount, who, isGroup, receives, notifies, prefs, S};
  window.MessengerOptions = {render: renderMessenger, handle: handleMessenger, back: backMessenger, notifies: mNotifies, archived: mBlocked, M};
})();
