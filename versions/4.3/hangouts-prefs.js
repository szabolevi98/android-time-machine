/* Hangouts 1.0.2 (Hangouts.apk of JWR66Y) beyond its chats: Settings, Hangout requests, Blocked People, People &
   options and Add people. From the APK:
   - Settings (BabelSettingsActivity.onBuildHeaders): a header per account, then preference_headers.xml's About Hangouts
     (about_babel.xml: Hangouts, Build version 1.0.2.717155, Open source licenses, Privacy policy, Terms of service). The
     account is babel_settings.xml as BabelSettingsFragment trims it: Profile photo, HANGOUT NOTIFICATIONS (Notifications,
     Sound, Vibrate, Hangout requests), VIDEO CALLS (Sound, Vibrate), HOW OTHERS GET IN TOUCH WITH YOU (Customize new
     requests: chat_acl_settings.xml's EVERYONE ELSE › Public, Hangout with you / Request only), ACCOUNT (Google+
     profile for a Google+ user instead of Join Google+, Blocked people, Sign out; Confirm phone number only with the
     server's verification flag).
   - Hangout requests (invites_title, no_invites_text) and Blocked People (blocked_people_fragment.xml).
   - People & options (ConversationParticipantsFragment.onCreateView): HANGOUT OPTIONS with Hangout name / Rename for a
     group (type 3), Notifications (level 30 ticked), Leave for a group or Block %s / Unblock %s for one person (type 2;
     the dialog's button is "Block person"), PEOPLE IN HANGOUT and Add People under a group; onPrepareOptionsMenu: New
     group Hangout for one person, Add people and New Hangout with this group for a group, Settings and Help.
   - Add people (uber_edit_audience_fragment.xml with new_conversation_activity_buttons.xml's Cancel and OK on the
     translucent green bar). From one person's chat it starts a group Hangout.
   What they change here: Hangouts notifications off, a quiet conversation or a snooze post no notification for an
   answer; a blocked person's messages do not arrive; groups keep their members and name. Profile photo, Sign out and
   the About page's licenses and web links stay account-service limits. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const lang = () => String(globalThis.document?.documentElement?.lang || '').slice(0, 2);
  const S = key => { const row = window.StockStrings?.hangouts?.[`hp.${key}`]; return row ? AndroidStrings.pick(row, lang(), row.en || key) : key; };
  const ACCOUNT = 'jellybean.demo@gmail.com', BUILD = '1.0.2.717155';
  const AVATAR = 'assets/hg1-default_avatar.png';
  // babel_settings.xml's defaults: notifications on, vibrate off, Hangout requests on; video vibrate off; INVITE.
  const DEFAULTS = {chatOn: true, chatVibrate: false, chatInvites: true, videoVibrate: false, acl: 'INVITE'};
  const prefs = data => ({...DEFAULTS, ...(data.hgPrefs || {})});
  const conv = (data, key) => data.hgConv?.[key] || {};
  const blocked = data => data.hgBlocked || [];
  const isGroup = key => /^g\d+$/.test(String(key));
  const group = (data, key) => data.hgGroups?.[key];
  const contact = (data, id) => data.contacts.find(p => String(p.id) === String(id));
  function who(data, key) {
    if (!isGroup(key)) return ICSMessaging.identity(key, data.contacts);
    const people = (group(data, key)?.members || []).map(id => contact(data, id)).filter(Boolean);
    return {name: group(data, key)?.name || people.map(p => p.name).join(', '), group: true, people};
  }
  const tones = kind => ['', ...Object.values(window.SystemSounds?.SOUNDS?.[kind] || {}).map(([title]) => title)];
  const defaultTone = kind => { const key = window.SystemSounds?.DEFAULTS?.[kind]; return window.SystemSounds?.SOUNDS?.[kind]?.[key]?.[0] || ''; };
  const toneOf = (value, kind) => value === undefined ? defaultTone(kind) : value;
  const receives = (data, key) => !blocked(data).includes(Number(key));
  const notifies = (data, key, now = Date.now()) => receives(data, key) && prefs(data).chatOn && !(data.hgSnooze > now) && !conv(data, key).quiet;

  const tick = on => `<i class="hgp-check${on ? ' on' : ''}" role="checkbox" aria-checked="${!!on}"></i>`;
  const row = (action, id, title, summary = '', extra = '', off = false) => `<button type="button" class="hgp-row${off ? ' off' : ''}" data-action="${action}" data-id="${e(id)}"${off ? ' disabled' : ''}><span class="hgp-text"><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
  const info = (title, summary) => `<div class="hgp-row hgp-info"><span class="hgp-text"><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span></div>`;
  const cat = title => `<h4 class="hgp-cat">${e(title)}</h4>`;
  const bar = (t, title, actions = '') => `<header class="hg-bar"><button type="button" class="hg-up" data-action="back" aria-label="${e(t('Navigate up'))}"><img class="hg-caret" src="assets/hg1-abs__ic_ab_back_holo_light.png" alt=""><img src="assets/hangouts.png" alt=""></button><div class="hg-title"><h2>${e(title)}</h2></div>${actions}</header>`;
  const overflow = t => `<button type="button" class="hg-ab-btn" data-action="hgp-menu" aria-label="${e(t('More options'))}"><img src="assets/hg1-abs__ic_menu_moreoverflow_normal_holo_light.png" alt=""></button>`;

  function settings(data, ui, t) {
    const p = prefs(data), page = ui.hgPage;
    if (page === 'settings') return [S('Settings'), row('hgp-page', 'account', ACCOUNT) + row('hgp-page', 'about', S('About Hangouts'))];
    if (page === 'account') return [ACCOUNT, row('hgp-limit', 'avatar', S('Profile photo'), S('Profile photo summary'))
      + cat(S('HANGOUT NOTIFICATIONS')) + row('hgp-toggle', 'chatOn', S('Notifications'), '', tick(p.chatOn)) + row('hgp-dialog', 'tone:chat', S('Sound'), toneOf(p.chatSound, 'notifications') || t('Silent'), '', !p.chatOn)
      + row('hgp-toggle', 'chatVibrate', S('Vibrate'), '', tick(p.chatVibrate), !p.chatOn) + row('hgp-toggle', 'chatInvites', S('Requests notify'), S('Requests notify summary'), tick(p.chatInvites), !p.chatOn)
      + cat(S('VIDEO CALLS')) + row('hgp-dialog', 'tone:video', S('Sound'), toneOf(p.videoSound, 'ringtones') || t('Silent')) + row('hgp-toggle', 'videoVibrate', S('Vibrate'), '', tick(p.videoVibrate))
      + cat(S('HOW OTHERS GET IN TOUCH WITH YOU')) + row('hgp-page', 'acl', S('Customize new requests'), S('Customize new requests summary'))
      + cat(S('ACCOUNT')) + row('hgp-profile', '', S('Google+ profile')) + row('hgp-page', 'blocked', S('Blocked people')) + row('hgp-limit', 'signout', S('Sign out'))];
    if (page === 'acl') return [S('Customize new requests'), cat(S('EVERYONE ELSE')) + row('hgp-dialog', 'acl', S('acl.public'), S(`acl.${p.acl}`))];
    if (page === 'about') return [S('About Hangouts'), cat(S('About')) + info(S('Hangouts'), '') + info(S('Build version'), BUILD) + row('hgp-limit', 'licenses', S('Open source licenses')) + row('hgp-limit', 'privacy', S('Privacy policy')) + row('hgp-limit', 'terms', S('Terms of service'))];
    return null;
  }
  function options(data, ui, t) {
    const key = String(ui.thread), person = who(data, key), on = !conv(data, key).quiet, many = isGroup(key), name = group(data, key)?.name || '';
    const option = (action, id, title, subtitle, img, extra = '') => `<button type="button" class="hgp-option" data-action="${action}" data-id="${e(id)}"><img class="hgp-icon" src="assets/hg1-${img}.png" alt=""><span class="hgp-text"><b>${e(title)}</b>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</span>${extra}</button>`;
    const isBlocked = !many && blocked(data).includes(Number(key));
    const people = many ? person.people : [contact(data, key) || person];
    const last = many ? option('hgp-dialog', 'leave', S('Leave'), '', 'ic_leave_gray')
      : !Number.isFinite(Number(key)) ? '' : isBlocked ? option('hgp-unblock', '', AndroidStrings.format(S('Unblock %s'), person.name), '', 'ic_ignore_gray')
      : option('hgp-dialog', 'block', AndroidStrings.format(S('Block %s'), person.name), '', 'ic_ignore_gray');
    const rows = (many ? option('hgp-dialog', 'rename', S(name ? 'Hangout name' : 'Rename'), name, 'ic_edit_gray') : '') + option('hgp-mute', '', S('Conversation notifications'), '', 'ic_unmute_gray', tick(on)) + last;
    const list = people.map(p => `<div class="hgp-person"><img class="hgp-avatar" src="${AVATAR}" alt=""><span class="hgp-text"><b>${e(p.name)}</b></span></div>`).join('');
    return [S('People & options'), `<h4 class="hgp-head">${e(S('HANGOUT OPTIONS'))}</h4>${rows}<h4 class="hgp-head">${e(S('PEOPLE IN HANGOUT'))}</h4>${list}${many ? option('hgp-page', 'add', S('Add People'), '', 'ic_people_add_gray') : ''}`, overflow(t)];
  }
  function addPeople(data, ui, t) {
    const key = String(ui.thread), many = isGroup(key) && !ui.hgFork, have = isGroup(key) ? (group(data, key)?.members || []).map(String) : [key];
    const chosen = ui.hgAdd || [], q = String(ui.hgAddQuery || '').toLocaleLowerCase();
    const chips = [...(many ? [] : have).map(id => contact(data, id)).filter(Boolean).map(p => `<span class="hgp-chip fixed">${e(p.name)}</span>`), ...chosen.map(id => contact(data, id)).filter(Boolean).map(p => `<button type="button" class="hgp-chip" data-action="hgp-pick" data-id="${p.id}">${e(p.name)}</button>`)].join('');
    const people = [...data.contacts].filter(p => !have.includes(String(p.id)) && !blocked(data).includes(p.id) && (!q || `${p.name} ${p.email || ''} ${p.phone || ''}`.toLocaleLowerCase().includes(q))).sort((a, b) => a.name.localeCompare(b.name));
    const list = people.map(p => `<button type="button" class="hgp-pick${chosen.includes(String(p.id)) ? ' on' : ''}" data-action="hgp-pick" data-id="${p.id}"><img class="hgp-avatar" src="${AVATAR}" alt=""><span class="hgp-text"><b>${e(p.name)}</b><small>${e(p.email || p.phone || '')}</small></span></button>`).join('');
    return [S(many ? 'Add people' : 'New group Hangout'), `<div class="hgp-audience">${chips}<input class="hgp-audience-field" data-hgp-query value="${e(ui.hgAddQuery || '')}" autocomplete="off" aria-label="${e(t('Type a name, email, number, or circle'))}" placeholder="${e(t('Type a name, email, number, or circle'))}"></div><div class="hgp-people">${list}</div>`, '',
      `<div class="hgp-buttons"><button type="button" data-action="back">${e(S('Cancel'))}</button><i></i><button type="button" data-action="hgp-add-ok"${chosen.length ? '' : ' disabled'}>${e(S('OK'))}</button></div>`];
  }
  function render(data, ui, t) {
    const page = ui.hgPage;
    let title = '', body = '', actions = '', foot = '', cls = '';
    if (page === 'invites') { title = S('Hangout requests'); body = `<p class="hgp-empty">${e(S('No Hangout requests'))}</p>`; }
    else if (page === 'blocked') {
      title = S('Blocked People');
      const people = blocked(data).map(id => contact(data, id)).filter(Boolean);
      body = people.length ? people.map(p => `<div class="hgp-blocked-row"><img class="hgp-avatar" src="${AVATAR}" alt=""><b>${e(p.name)}</b><i></i><button type="button" data-action="hgp-unblock" data-id="${p.id}">${e(S('Unblock'))}</button></div>`).join('')
        : `<div class="hgp-zero"><img src="assets/hg1-ic_zero_blocked.png" alt=""><b>${e(S('No blocked people'))}</b></div>`;
    } else if (page === 'options') { [title, body, actions] = options(data, ui, t); cls = ' hgp-options'; }
    else if (page === 'add') { [title, body, actions, foot] = addPeople(data, ui, t); cls = ' hgp-add'; }
    else { const s = settings(data, ui, t); if (!s) return ''; [title, body] = s; cls = ' hgp-settings'; }
    return `<div class="app-view hg-app hgp-app${cls}">${bar(t, title, actions)}<div class="hgp-scroll">${body}</div>${foot}${dialog(data, ui, t)}</div>`;
  }
  function dialog(data, ui, t) {
    const d = ui.hgDialog; if (!d) return '';
    const p = prefs(data), key = String(ui.thread);
    const scrim = `<button type="button" class="hgp-scrim" data-action="hgp-close" aria-label="${e(S('Cancel'))}"></button>`;
    const box = (title, inner, buttons) => `${scrim}<div class="hgp-dialog" role="dialog"><h3>${e(title)}</h3>${inner}${buttons ? `<div class="hgp-dialog-buttons">${buttons}</div>` : ''}</div>`;
    const cancel = `<button type="button" data-action="hgp-close">${e(S('Cancel'))}</button>`;
    const choice = (action, i, label, on) => `<button type="button" class="hgp-choice${on ? ' on' : ''}" data-action="${action}" data-id="${i}" role="radio" aria-checked="${on}"><span>${e(label)}</span><i></i></button>`;
    if (d.startsWith('tone:')) {
      const kind = d === 'tone:video' ? 'ringtones' : 'notifications', names = tones(kind), at = ui.hgTone ?? Math.max(0, names.indexOf(toneOf(p[`${d.slice(5)}Sound`], kind)));
      return box(S('Sound'), `<div class="hgp-list">${names.map((name, i) => choice('hgp-tone', i, i ? name : t('Silent'), at === i)).join('')}</div>`, cancel + `<button type="button" data-action="hgp-tone-ok">${e(S('OK'))}</button>`);
    }
    if (d === 'acl') return box(S('acl.public'), ['RING', 'INVITE'].map(v => choice('hgp-acl', v, S(`acl.${v}`), p.acl === v)).join(''), cancel);
    // AlertDialogFragment: Block person / Cancel and Leave / Cancel.
    if (d === 'block') return box(AndroidStrings.format(S('Block title'), who(data, key).name), `<p class="hgp-msg">${e(String(S('Block text')).replace(/<[^>]+>/g, ''))}</p>`, cancel + `<button type="button" data-action="hgp-block">${e(S('Block person'))}</button>`);
    if (d === 'leave') return box(S('Leave Hangout'), `<p class="hgp-msg">${e(S('Leave text'))}</p>`, cancel + `<button type="button" data-action="hgp-leave">${e(S('Leave button'))}</button>`);
    if (d === 'rename') return box(S('Edit name'), `<input class="hgp-edit" data-hgp-edit maxlength="100" value="${e(group(data, key)?.name || '')}">`, cancel + `<button type="button" data-action="hgp-rename">${e(S('OK'))}</button>`);
    if (d === 'menu') {
      const item = (action, id, label) => `<button type="button" data-action="${action}" data-id="${id}">${e(label)}</button>`;
      const many = isGroup(key);
      return `<button type="button" class="hgp-scrim clear" data-action="hgp-close" aria-label="${e(S('Cancel'))}"></button><div class="hg-menu hgp-menu" role="menu">${many ? item('hgp-page', 'add', S('Add people')) + item('hgp-fork', '', S('New Hangout with this group')) : item('hgp-fork', '', S('New group Hangout'))}${item('hgp-page', 'settings', S('Settings'))}${item('hgp-limit', 'help', S('Help'))}</div>`;
    }
    return '';
  }
  const set = (data, patch) => { data.hgPrefs = {...(data.hgPrefs || {}), ...patch}; };
  function handle(action, id, ctx) {
    const {data, ui} = ctx, key = String(ui.thread), p = prefs(data);
    const close = () => { window.SystemSounds?.stop(); ui.hgDialog = ''; ui.hgTone = undefined; };
    switch (action) {
      case 'hgp-open': ui.overlay = ''; ctx.renderOverlay?.(); ui.hgPage = id; ui.hgStack = []; ui.hgAdd = []; ui.hgAddQuery = ''; ui.hgFork = id === 'add' && !isGroup(key); ctx.render(); return true;
      case 'hgp-page': close(); if (id === 'add') { ui.hgAdd = []; ui.hgAddQuery = ''; ui.hgFork = false; } (ui.hgStack ||= []).push(ui.hgPage); ui.hgPage = id; ctx.render(); return true;
      case 'hgp-toggle': set(data, {[id]: !p[id]}); ctx.save(); ctx.render(); return true;
      case 'hgp-dialog': ui.hgDialog = id; ui.hgTone = undefined; ctx.render(); ctx.root.querySelector('[data-hgp-edit]')?.focus(); return true;
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
      case 'hgp-block': data.hgBlocked = [...new Set([...blocked(data), Number(key)])]; ctx.save(); close(); ctx.render(); return true;
      case 'hgp-unblock': {
        const target = Number(id || key), person = contact(data, target);
        data.hgBlocked = blocked(data).filter(x => x !== target); ctx.save(); ctx.render();
        if (ui.hgPage === 'options' && person) ctx.toast(AndroidStrings.format(S('Unblocked %s'), person.name)); return true;
      }
      case 'hgp-leave': {
        data.messages = data.messages.filter(m => String(m.contact) !== key);
        if (data.messageDrafts) delete data.messageDrafts[key];
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
        const next = `g${(data.hgNextGroup = (data.hgNextGroup || 0) + 1)}`;
        data.hgGroups = {...(data.hgGroups || {}), [next]: {members: [...new Set([...base, ...chosen])], name: ''}};
        ui.hgPage = ''; ui.hgStack = []; ui.hgAdd = []; ui.hgFork = false; ctx.save(); ctx.openThread(next); return true;
      }
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
  window.HangoutsPrefs = {render, handle, back, mount, who, isGroup, receives, notifies, prefs, S};
})();
