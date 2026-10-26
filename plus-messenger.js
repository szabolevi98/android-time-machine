/* Google+ Messenger (the image's PlusOne.apk: 4.0.4's Google+ 2.4, 4.3's Google+ 4.0) beyond its conversation list:
   a conversation (conversation_activity: message_list_item_view rows with the 48 dp avatar, the author, the time and
   the text; compose_message(_fragment) with the photo button, "Type a message" and Send), New conversation
   (new_conversation_activity: the audience field "Type a name, email, or circle" over the contacts, the compose bar
   under it), the conversation menu (Mute / Unmute, Edit name, Add people, Leave with its confirmation) and Messenger's
   settings (2.4: realtimechat_settings.xml, 4.0: realtimechat_preferences.xml). Conversations live in data.plusChats
   ({id, people: [contact ids], name, muted, messages: [{me, text, at}]}); the first use seeds the three the list has
   always shown. Messages are only kept on the phone: nobody answers, photos and Add people stay Google's.
   Each version draws the list rows and the action bar (ctx.list, ctx.bar); the rest is drawn here with gpm- classes
   and, for the settings, the version's mps- preference rows. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // The conversations the list has always shown: the first three contacts, their last message, today and Monday.
  const SEED = [['Saturday’s hike: who’s driving?', 0, 10, 24], ['Photos from the meetup', 0, 9, 2], ['See you at 11!', 3, 18, 40]];
  function chats(ctx) {
    const {data} = ctx;
    if (!data.plusChats) {
      const now = new Date(ctx.now || Date.now());
      data.plusChats = ctx.contacts.slice(0, 3).map((p, i) => { const [text, days, h, m] = SEED[i]; const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days, h, m).getTime(); return {id: `c${i + 1}`, people: [p.id], name: '', muted: false, messages: [{me: false, text, at}]}; });
    }
    return data.plusChats;
  }
  const person = (ctx, id) => ctx.contacts.find(p => String(p.id) === String(id));
  const title = (ctx, c) => c.name || c.people.map(id => person(ctx, id)?.name || '').filter(Boolean).join(', ');
  const last = c => c.messages[c.messages.length - 1];
  // The list's time: the clock today, the weekday this week, else the date.
  function when(ctx, at) {
    const d = new Date(at), now = new Date(ctx.now || Date.now()), locale = ctx.locale || 'en-US';
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'});
    if (now - d < 6 * 864e5) return d.toLocaleDateString(locale, {weekday: 'short'});
    return d.toLocaleDateString(locale, {month: 'short', day: 'numeric'});
  }
  // The rows of the list, newest first: {id, title, snippet, time, muted}.
  const rows = ctx => [...chats(ctx)].sort((a, b) => last(b).at - last(a).at).map(c => ({id: c.id, title: title(ctx, c), snippet: last(c).text, time: when(ctx, last(c).at), muted: c.muted}));
  const compose = (ctx, form) => `<form class="gpm-compose" data-form="${form}"><button type="button" class="gpm-photo" data-action="kkx-unavailable" aria-label="${e(ctx.t('Photo'))}"><img src="${e(ctx.photoIcon)}" alt=""></button><input name="text" autocomplete="off" placeholder="${e(ctx.S('Type a message'))}" aria-label="${e(ctx.S('Type a message'))}"><button class="gpm-send" aria-label="${e(ctx.t('Send'))}"><img src="${e(ctx.sendIcon)}" alt=""></button></form>`;
  function thread(ctx, c) {
    const me = ctx.me || ctx.t('Me');
    const msgs = c.messages.map(m => { const p = m.me ? null : person(ctx, c.people[0]); return `<div class="gpm-msg${m.me ? ' me' : ''}"><span class="gpm-avatar"><img src="${e(ctx.avatar)}" alt=""></span><div class="gpm-body"><div class="gpm-head"><b>${e(m.me ? me : p?.name || '')}</b><time>${e(when(ctx, m.at))}</time></div><p>${e(m.text)}</p></div></div>`; }).join('');
    return `<div class="app-view kkx-app gpm gpm-thread">${ctx.bar({title: title(ctx, c), up: true})}<div class="gpm-list">${msgs}</div>${compose(ctx, 'gpm-send')}${dialog(ctx)}</div>`;
  }
  function picker(ctx) {
    const q = String(ctx.ui.gpmQuery || '').toLowerCase(), chosen = ctx.ui.gpmTo || [];
    const people = ctx.contacts.filter(p => !q || p.name.toLowerCase().includes(q));
    const chips = chosen.map(id => `<button class="gpm-chip" data-action="gpm-unpick" data-id="${e(id)}">${e(person(ctx, id)?.name || '')} ×</button>`).join('');
    return `<div class="app-view kkx-app gpm gpm-new">${ctx.bar({title: ctx.S('New conversation'), up: true})}<div class="gpm-audience">${chips}<input data-gpm-query autocomplete="off" value="${e(ctx.ui.gpmQuery || '')}" placeholder="${e(ctx.S('Type a name, email, or circle'))}" aria-label="${e(ctx.S('Type a name, email, or circle'))}"></div><div class="gpm-people">${people.map(p => `<button class="gpm-person${chosen.includes(p.id) ? ' on' : ''}" data-action="gpm-pick" data-id="${e(p.id)}"><img src="${e(ctx.avatar)}" alt=""><span><b>${e(p.name)}</b><small>${e(p.phone || p.email || '')}</small></span></button>`).join('')}</div>${compose(ctx, 'gpm-new')}</div>`;
  }
  // Messenger's settings: 2.4's realtimechat_settings.xml (a category over Who can message you, notifications,
  // vibrate, ringtone, with summaries) or 4.0's realtimechat_preferences.xml (no category or summaries; Who can add
  // you shows the chosen setting's subtitle). The ringtone is a notification sound of the phone.
  function prefRows(ctx) {
    const v = (key, def) => ctx.data.plusMessengerPrefs?.[key] ?? def, S = ctx.S;
    const acl = {kind: 'list', key: 'acl', title: S(ctx.version === '2.4' ? 'Who can message you' : 'Who can add you to conversations'), options: [0, 1, 2].map(i => S(`@acl:${i}`)), def: 0};
    if (ctx.version === '4.0') acl.summary = S(`@acl_sub:${v('acl', 0)}`);
    const notify = {kind: 'check', key: 'notify', title: S('Messenger notifications'), def: true, summary: ctx.version === '2.4' ? S('Show when messages are received') : ''};
    const vibrate = {kind: 'check', key: 'vibrate', title: S('Vibrate'), def: true, summary: ctx.version === '2.4' ? S('Also vibrate when messages are received') : ''};
    const tone = {kind: 'tone', key: 'ringtone', title: S('Ringtone'), summary: ctx.version === '2.4' ? S('Set a ringtone for new messages') : ''};
    return ctx.version === '2.4' ? [{kind: 'cat', title: S('Messenger notifications')}, acl, notify, vibrate, tone] : [notify, tone, vibrate, acl];
  }
  const sounds = () => { const all = window.SystemSounds?.SOUNDS?.notifications || {}; return Object.keys(all); };
  const soundName = key => window.SystemSounds?.SOUNDS?.notifications?.[key]?.[0] || key;
  function settings(ctx) {
    const v = (key, def) => ctx.data.plusMessengerPrefs?.[key] ?? def;
    const row = r => {
      if (r.kind === 'cat') return `<div class="mps-cat">${e(r.title)}</div>`;
      const on = r.kind === 'check' && v(r.key, r.def);
      return `<button class="mps-row" data-action="gpm-pref" data-id="${e(r.key)}"${r.kind === 'check' ? ` role="checkbox" aria-checked="${on}"` : ''}><span><b>${e(r.title)}</b>${r.summary ? `<small>${e(r.summary)}</small>` : ''}</span>${r.kind === 'check' ? `<i class="mps-check${on ? ' on' : ''}" role="presentation"></i>` : ''}</button>`;
    };
    return `<div class="app-view kkx-app mps gpm-prefs">${ctx.bar({title: ctx.S('Settings'), up: true})}<div class="mps-list">${prefRows(ctx).map(row).join('')}</div>${dialog(ctx)}</div>`;
  }
  // The open dialog: a list preference, the ringtone, Edit name or Leave conversation.
  function dialog(ctx) {
    const d = ctx.ui.gpmDialog, S = ctx.S; if (!d) return '';
    const shell = (title, body, buttons) => `<button class="mps-scrim" data-action="gpm-cancel" aria-label="${e(S('Cancel'))}"></button><div class="mps-dialog" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3>${body}<div class="mps-buttons">${buttons}</div></div>`;
    const radio = (id, label, on) => `<button data-action="gpm-pick-value" data-id="${e(id)}" role="radio" aria-checked="${on}"><span>${e(label)}</span><i class="mps-radio${on ? ' on' : ''}"></i></button>`;
    const cancel = `<button data-action="gpm-cancel">${e(S('Cancel'))}</button>`;
    const v = (key, def) => ctx.data.plusMessengerPrefs?.[key] ?? def;
    if (d === 'acl') { const r = prefRows(ctx).find(x => x.key === 'acl'); return shell(r.title, `<div class="mps-choices">${r.options.map((label, i) => radio(`acl:${i}`, label, v('acl', 0) === i)).join('')}</div>`, cancel); }
    if (d === 'ringtone') { const cur = v('ringtone', window.SystemSounds?.DEFAULTS?.notifications || ''); return shell(S('Ringtone'), `<div class="mps-choices">${sounds().map(k => radio(`ringtone:${k}`, soundName(k), cur === k)).join('')}</div>`, cancel); }
    if (d === 'rename') return shell(S('Edit name'), `<input data-gpm-name autocomplete="off" maxlength="60" placeholder="${e(S('Conversation name'))}" value="${e(chats(ctx).find(c => c.id === ctx.ui.gpmThread)?.name || '')}">`, `${cancel}<button data-action="gpm-rename-ok">${e(S('Save'))}</button>`);
    if (d === 'leave') return shell(S('Leave conversation'), `<p>${e(S('@leave_text'))}</p>`, `${cancel}<button data-action="gpm-leave-ok">${e(S('Leave'))}</button>`);
    return '';
  }
  // The screen: Settings, New conversation, a conversation, or the version's list (ctx.list(rows)).
  function render(ctx) {
    const {ui} = ctx;
    if (ui.gpmPrefs) return settings(ctx);
    if (ui.gpmNew) return picker(ctx);
    const c = ui.gpmThread && chats(ctx).find(x => x.id === ui.gpmThread);
    if (c) return thread(ctx, c);
    const list = rows(ctx);
    return ctx.list(list.length ? list : null);
  }
  // The overflow: a conversation's own menu, else the list's (the APK's order; only Settings is local).
  function menu(ctx) {
    const {ui} = ctx, S = ctx.S;
    if (ui.gpmPrefs || ui.gpmNew) return [];
    const c = ui.gpmThread && chats(ctx).find(x => x.id === ui.gpmThread);
    if (c) return [{action: 'gpm-mute', title: S(c.muted ? 'Unmute' : 'Mute')}, {action: 'gpm-rename', title: S('Edit name')}, {action: 'kkx-unavailable', title: S('Add people')}, {action: 'gpm-leave', title: S('Leave')}];
    return ctx.listMenu.map(key => ({action: key === 'Settings' ? 'gpm-settings' : 'kkx-unavailable', title: S(key)}));
  }
  function send(ctx, c, text) { c.messages.push({me: true, text, at: Date.now()}); ctx.save(); }
  // ctx: {ui, data, t, S (gplus texts), contacts, now, locale, save, render, toast, bar, list, avatar, photoIcon, sendIcon,
  // version ('2.4' | '4.0'), listMenu (the list menu's keys: Settings opens the settings, the rest are Google's)}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx, prefs = () => (data.plusMessengerPrefs ||= {});
    switch (action) {
      case 'gpm-open': ui.gpmThread = id; break;
      case 'gpm-new-open': ui.gpmNew = true; ui.gpmTo = []; ui.gpmQuery = ''; break;
      case 'gpm-pick': { const to = ui.gpmTo ||= [], i = to.indexOf(id); if (i >= 0) to.splice(i, 1); else to.push(id); ui.gpmQuery = ''; break; }
      case 'gpm-unpick': ui.gpmTo = (ui.gpmTo || []).filter(x => x !== id); break;
      case 'gpm-settings': ui.gpmPrefs = true; break;
      case 'gpm-pref': {
        const r = prefRows(ctx).find(x => x.key === id); if (!r) return true;
        if (r.kind === 'check') { prefs()[id] = !(data.plusMessengerPrefs?.[id] ?? r.def); ctx.save(); }
        else ui.gpmDialog = id;
        break;
      }
      case 'gpm-pick-value': { const [key, ...rest] = String(id).split(':'), value = rest.join(':'); prefs()[key] = key === 'acl' ? Number(value) : value; window.SystemSounds?.stop?.(); ctx.save(); ui.gpmDialog = ''; break; }
      case 'gpm-cancel': window.SystemSounds?.stop?.(); ui.gpmDialog = ''; break;
      case 'gpm-mute': { const c = chats(ctx).find(x => x.id === ui.gpmThread); if (c) { c.muted = !c.muted; ctx.save(); } break; }
      case 'gpm-rename': ui.gpmDialog = 'rename'; break;
      case 'gpm-rename-ok': { const c = chats(ctx).find(x => x.id === ui.gpmThread), input = document.querySelector('[data-gpm-name]'); if (c && input) { c.name = input.value.trim().slice(0, 60); ctx.save(); } ui.gpmDialog = ''; break; }
      case 'gpm-leave': ui.gpmDialog = 'leave'; break;
      case 'gpm-leave-ok': data.plusChats = chats(ctx).filter(x => x.id !== ui.gpmThread); ctx.save(); ui.gpmDialog = ''; ui.gpmThread = ''; break;
      default: return false;
    }
    ctx.render();
    if (ui.gpmDialog === 'rename') requestAnimationFrame(() => document.querySelector('[data-gpm-name]')?.focus());
    return true;
  }
  // A message from the compose bar: into the open conversation, or (New conversation) into the chosen person's
  // conversation, which is started when there is none yet.
  function submit(form, values, ctx) {
    if (form !== 'gpm-send' && form !== 'gpm-new') return false;
    const {ui} = ctx, text = String(values.get('text') || '').trim();
    if (!text) return true;
    if (form === 'gpm-send') { const c = chats(ctx).find(x => x.id === ui.gpmThread); if (c) send(ctx, c, text); }
    else {
      const to = ui.gpmTo || []; if (!to.length) return true;
      const key = [...to].sort().join(','), list = chats(ctx);
      let c = list.find(x => [...x.people].sort().join(',') === key);
      if (!c) { c = {id: `c${Date.now()}`, people: [...to], name: '', muted: false, messages: []}; list.push(c); }
      send(ctx, c, text); ui.gpmNew = false; ui.gpmTo = []; ui.gpmThread = c.id;
    }
    ctx.render();
    requestAnimationFrame(() => { const l = document.querySelector('.gpm-list'); if (l) l.scrollTop = l.scrollHeight; });
    return true;
  }
  // The audience field filters the contacts as it is typed.
  function input(target, ctx) {
    if (!target.matches?.('[data-gpm-query]')) return false;
    ctx.ui.gpmQuery = target.value;
    const q = target.value.toLowerCase();
    document.querySelectorAll('.gpm-person').forEach(b => { b.hidden = q && !b.textContent.toLowerCase().includes(q); });
    return true;
  }
  // Back: a dialog, then Settings / New conversation / the conversation.
  function back(ui) {
    if (ui.gpmDialog) { ui.gpmDialog = ''; window.SystemSounds?.stop?.(); return true; }
    if (ui.gpmPrefs) { ui.gpmPrefs = false; return true; }
    if (ui.gpmNew) { ui.gpmNew = false; ui.gpmTo = []; return true; }
    if (ui.gpmThread) { ui.gpmThread = ''; return true; }
    return false;
  }
  const open = ui => Object.assign(ui, {gpmThread: '', gpmNew: false, gpmPrefs: false, gpmDialog: '', gpmTo: [], gpmQuery: ''});
  window.PlusMessenger = {render, menu, handle, submit, input, back, open, rows};
})();
