/* Android 5.1.1 multiple users, after the Nexus 6 LMY48Y image (Settings' UserSettings and UserDetailsSettings,
   SystemUI's guest dialogs, the framework's UserSwitchingDialog); each user is a saved phone of its own: simulator.js
   keeps the current user's data under its key with "-<id>" (sessionStorage lp-user), the list of users is shared
   (android-time-machine-lp-users).
   - Settings > Users on a phone (no restricted profiles, so no category): "You (Owner)" with Owner under it, the users
     added ("Not set up" until they were used), Guest, then Add user. The own row opens Profile info (the row's title in
     the field; OK keeps a changed name); another user's row switches to them (one never set up asks "Set up user now?"
     first); Guest switches to the guest; on this voice capable phone the owner's other rows carry the manage button
     (preference_user_delete_widget: a divider and ic_sysbar_quicksettings) that opens UserDetailsSettings: Allow phone
     calls and SMS (for the guest Allow phone calls) and Remove user (Remove this user? / Delete) or Remove guest.
   - Add user: "Add new user?" (user_add_user_message_long), OK, then "Set up user now?": Not now leaves a "New user",
     Set up now switches to it.
   - Switching shows UserSwitchingDialog's "Switching to …" and the phone comes back as that user. In the guest session
     the own row reads Remove guest (Remove guest? / Remove: back to the owner, the guest's data gone); coming back to a
     guest that was used asks "Welcome back, guest!" (Start over wipes it, Yes, continue keeps it). */
window.LPUsers = (() => {
  'use strict';
  const KEY = 'android-time-machine-lp-users', STORE = 'android-time-machine-lp-v1';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const t = key => window.AndroidI18n?.t?.(key) ?? key;
  const fmt = (key, ...args) => AndroidStrings.format(t(key), ...args);
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
  const store = id => id === 'owner' ? STORE : `${STORE}-${id}`;
  const current = () => { try { return sessionStorage.getItem('lp-user') || 'owner'; } catch { return 'owner'; } };
  const list = () => read().users || [];
  const ownerName = () => read().ownerName || t('Owner');
  const name = id => id === 'owner' ? ownerName() : id === 'guest' ? t('Guest') : (list().find(u => u.id === id)?.name || t('New user'));
  const setUp = id => { try { return id === 'owner' || localStorage.getItem(store(id)) !== null; } catch { return true; } };

  // A Material AlertDialog of the simulator's settings style over the screen; buttons right-aligned, the last positive.
  function dialog({title, message = '', html = '', buttons = [], cancelable = true, mount}) {
    const screen = document.querySelector('#screen');
    screen.querySelector('.lpu-host')?.remove();
    const host = document.createElement('div');
    host.className = 'lpu-host';
    host.innerHTML = `<div class="settings-dialog-scrim"></div><div class="settings-dialog lpu-dialog" role="dialog" aria-label="${e(title)}">${title ? `<h3>${e(title)}</h3>` : ''}${message ? `<p>${e(message)}</p>` : ''}${html}${buttons.length ? `<div class="settings-dialog-actions">${buttons.map((b, i) => `<button type="button" data-i="${i}">${e(b.label)}</button>`).join('')}</div>` : ''}</div>`;
    screen.append(host);
    const close = () => host.remove();
    host.querySelector('.settings-dialog-scrim').addEventListener('click', () => { if (cancelable) close(); });
    host.querySelectorAll('.settings-dialog-actions button').forEach(btn => btn.addEventListener('click', ev => { ev.stopPropagation(); close(); buttons[+btn.dataset.i].action?.(); }));
    mount?.(host);
    return close;
  }
  function switchTo(id) {
    dialog({message: fmt('Switching to %1$s…', name(id)), cancelable: false});
    setTimeout(() => { try { sessionStorage.setItem('lp-user', id); } catch {} location.reload(); }, 900);
  }
  function addUser() {
    const v = read(), n = v.next || 1;
    v.users = [...(v.users || []), {id: `u${n}`, name: t('New user')}]; v.next = n + 1; write(v);
    return `u${n}`;
  }
  function removeGuest() {
    const v = read(); delete v.guest; delete v.guestUsed; write(v);
    try { localStorage.removeItem(store('guest')); } catch {}
    if (current() === 'guest') switchTo('owner');
  }

  const avatar = (id) => `<span class="lp-user-avatar${id === 'guest' ? ' guest' : ''}"><img src="assets/lp-fw-ic_account_circle-dark.svg" alt=""></span>`;
  const manage = id => `<span class="lpu-manage" role="button" data-action="lpu-manage" data-id="${e(id)}" aria-label="${e(t('Settings'))}"><i class="lpu-divider"></i><img src="assets/lp-st-ic_sysbar_quicksettings.png" alt=""></span>`;
  const row = (action, id, title, summary, gear) => `<div class="settings-row lpu-row"><button type="button" class="lpu-main" data-action="${action}" data-id="${e(id)}">${avatar(id)}<span class="row-copy">${e(title)}${summary ? `<small>${e(summary)}</small>` : ''}</span></button>${gear ? manage(id) : ''}</div>`;
  // updateUserList: the own row first by serial number (the owner is 0), the users added, the guest last.
  function page() {
    const me = current(), owner = me === 'owner';
    const rows = ['owner', ...list().map(u => u.id)].map(id => id === me
      ? row('lpu-me', id, fmt('You (%s)', name(id)), owner ? t('Owner') : '', false)
      : row('lpu-user', id, name(id), id === 'owner' ? t('Owner') : setUp(id) ? '' : t('Not set up'), owner));
    rows.push(me === 'guest' ? row('lpu-me', 'guest', t('Remove guest'), '', false) : row('lpu-guest', 'guest', t('Guest'), '', owner));
    const add = owner ? `<button type="button" class="settings-row" data-action="lpu-add"><span class="lp-user-avatar add">+</span><span class="row-copy">${e(t('Add user'))}</span></button>` : '';
    return {title: 'Users', body: rows.join('') + add};
  }
  // UserDetailsSettings (user_details_settings.xml).
  function detail(id, data) {
    const guest = id === 'guest', calls = (data.settings.userCalls || {})[id] ?? !guest;
    return {title: guest ? t('Guest') : name(id), body: `<button class="settings-row lp-switch-row" data-action="lpu-calls" data-id="${e(id)}" role="switch" aria-checked="${calls}"><span class="row-copy">${e(t(guest ? 'Allow phone calls' : 'Allow phone calls and SMS'))}</span><span class="lp-mswitch${calls ? ' on' : ''}"><span></span></span></button><button class="settings-row" data-action="lpu-remove" data-id="${e(id)}"><span class="row-copy">${e(t(guest ? 'Remove guest' : 'Remove user'))}</span></button>`};
  }
  function handle(action, el, {data, save, render, open, back}) {
    const id = el.dataset.id;
    if (action === 'lpu-me') {
      if (current() === 'guest') { dialog({title: t('Remove guest?'), message: t('All apps and data in this session will be deleted.'), buttons: [{label: t('Cancel')}, {label: t('Remove'), action: removeGuest}]}); return true; }
      const shown = fmt('You (%s)', name(current()));
      let value = shown;
      dialog({title: t('Profile info'), html: `<div class="lpu-profile"><img src="assets/lp-fw-ic_account_circle-dark.svg" alt=""><input type="text" value="${e(shown)}" spellcheck="false"></div>`,
        buttons: [{label: t('Cancel')}, {label: t('OK'), action: () => {
          const v = value.trim(); if (!v || value === shown) return;
          const all = read(), me = current();
          if (me === 'owner') all.ownerName = v; else all.users = (all.users || []).map(u => u.id === me ? {...u, name: v} : u);
          write(all); render();
        }}], mount: host => { const input = host.querySelector('input'); input.addEventListener('input', () => { value = input.value; }); setTimeout(() => input.focus(), 50); }});
      return true;
    }
    if (action === 'lpu-user') {
      if (setUp(id)) switchTo(id);
      else dialog({title: t('Set up user now?'), message: t('Make sure the person is available to take the device and set up their space'), buttons: [{label: t('Not now')}, {label: t('Set up now'), action: () => switchTo(id)}]});
      return true;
    }
    if (action === 'lpu-guest') { const v = read(); v.guest = true; write(v); switchTo('guest'); return true; }
    if (action === 'lpu-add') {
      dialog({title: t('Add new user?'), message: t("You can share this device with other people by creating additional users. Each user has their own space, which they can customize with their own apps, wallpaper, and so on. Users can also adjust device settings like Wi‑Fi that affect everyone.\n\nWhen you add a new user, that person needs to set up their space.\n\nAny user can update apps for all other users."),
        buttons: [{label: t('Cancel')}, {label: t('OK'), action: () => dialog({title: t('Set up user now?'), message: t('Make sure the person is available to take the device and set up their space'),
          buttons: [{label: t('Not now'), action: () => { addUser(); render(); }}, {label: t('Set up now'), action: () => switchTo(addUser())}]})}]});
      return true;
    }
    if (action === 'lpu-manage') { open(`user:${id}`); return true; }
    if (action === 'lpu-calls') { const s = data.settings; s.userCalls = {...(s.userCalls || {}), [id]: !((s.userCalls || {})[id] ?? id !== 'guest')}; save(); render(); return true; }
    if (action === 'lpu-remove') {
      if (id === 'guest') dialog({title: t('Remove guest?'), message: t('All apps and data in this session will be deleted.'), buttons: [{label: t('Cancel')}, {label: t('Remove'), action: () => { removeGuest(); back(); }}]});
      else dialog({title: t('Remove this user?'), message: t('All apps and data will be deleted.'), buttons: [{label: t('Cancel')}, {label: t('Delete'), action: () => {
        const v = read(); v.users = (v.users || []).filter(u => u.id !== id); write(v);
        try { localStorage.removeItem(store(id)); } catch {}
        back();
      }}]});
      return true;
    }
    return false;
  }
  // SystemUI's guest resume dialog when a used guest session starts again.
  function start() {
    if (current() !== 'guest') return;
    const v = read();
    if (v.guestUsed) setTimeout(() => dialog({title: t('Welcome back, guest!'), message: t('Do you want to continue your session?'), cancelable: false, buttons: [
      {label: t('Start over'), action: () => { try { localStorage.removeItem(store('guest')); } catch {} location.reload(); }},
      {label: t('Yes, continue')}]}), 1200);
    v.guestUsed = true; v.guest = true; write(v);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  return {page, detail, handle, current, storeKey: store};
})();
