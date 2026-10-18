/* Android 6.0.1 multiple users (UserManager, SystemUI's UserSwitcherController, the framework's UserSwitchingDialog),
   each user a saved phone of its own (mm-core.js keeps the current user's data under its own key; the list of users is
   shared by all of them).
   - Quick settings' user detail and Settings > Users list the owner, the users added, the guest and Add user.
   - Guest (the overlay 'user-guest'): the guest is created if there is none and the phone switches to it
     (user_switching_message, then the guest's own phone); coming back to a guest that was used asks guest_wipe_session
     (Start over wipes it, Yes, continue keeps it). In the guest session its tile reads Remove guest (guest_exit_guest:
     the dialog, then back to the owner with the guest's data gone), and the shade shows the Guest user notification
     with REMOVE GUEST.
   - Add user (the overlay 'user-add'): AddUserDialog's Add new user? (user_add_user_message_short), OK creates
     "New user" and switches to it. A new user on the phone starts in SetupWizard; the simulator has no setup wizard, so
     the new user starts on the Home screen.
   - Settings > Users: the owner's row edits the name (EditUserInfoController's User info dialog), another user's opens
     UserDetailsSettings (Allow phone calls & SMS, Remove user), the guest's Allow phone calls and Remove guest. */
(() => {
  'use strict';
  const T = () => MM.text('users');
  const KEY = 'android-time-machine-mm-users';
  const esc = (c, s) => c.safe(s);
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
  const store = id => `android-time-machine-mm-v1${id === 'owner' ? '' : `-${id}`}`;
  const U = MM.users = {
    current: c => c.user || 'owner',
    list: () => read().users || [],
    hasGuest: () => !!read().guest,
    ownerName: () => read().ownerName || T().t('framework/owner_name'),
    name: id => id === 'owner' ? U.ownerName() : id === 'guest' ? T().t('guest_nickname') : (U.list().find(u => u.id === id)?.name || T().t('user_new_user_name')),
    setOwnerName: name => { const v = read(); v.ownerName = name; write(v); },
    switchTo(c, id) {
      c.dialog({progress: T().fmt('framework/user_switching_message', null, U.name(id)), cancelable: false});
      setTimeout(() => { try { sessionStorage.setItem('mm-user', id); } catch {} location.reload(); }, 900);
    },
    addUser(c) {
      const v = read(), n = (v.next || 1);
      v.users = [...(v.users || []), {id: `u${n}`, name: T().t('user_new_user_name')}]; v.next = n + 1; write(v);
      return `u${n}`;
    },
    removeUser(id) {
      const v = read(); v.users = (v.users || []).filter(u => u.id !== id); write(v);
      try { localStorage.removeItem(store(id)); } catch {}
    },
    removeGuest(c) {
      const v = read(); delete v.guest; delete v.guestUsed; write(v);
      try { localStorage.removeItem(store('guest')); } catch {}
      if (U.current(c) === 'guest') U.switchTo(c, 'owner');
    },
    guest(c) {
      const v = read();
      if (!v.guest) { v.guest = true; write(v); }
      U.switchTo(c, 'guest');
    },
    exitGuestDialog(c) {
      const t = T();
      c.dialog({title: t.t('guest_exit_guest_dialog_title'), message: t.t('guest_exit_guest_dialog_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('guest_exit_guest_dialog_remove'), action: c => U.removeGuest(c)}]});
    }
  };

  MM.register('user-guest', {
    app: false,
    render: () => '',
    mount(c) { c.closeOverlay(); if (U.current(c) === 'guest') U.exitGuestDialog(c); else U.guest(c); }
  });
  MM.register('user-add', {
    app: false,
    render: () => '',
    mount(c) {
      const t = T();
      c.closeOverlay();
      c.dialog({title: t.t('user_add_user_title'), message: t.t('user_add_user_message_short'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => U.switchTo(c, U.addUser(c))}]});
    }
  });

  // The guest session: Welcome back on a later start, and the Guest user notification.
  MM.register('users', {
    app: false,
    render: () => '',
    init(c) {
      if (U.current(c) !== 'guest') return;
      const v = read(), t = T();
      if (v.guestUsed) setTimeout(() => c.dialog({title: t.t('guest_wipe_session_title'), message: t.t('guest_wipe_session_message'), cancelable: false, buttons: [
        {label: t.t('guest_wipe_session_wipe'), action: () => { try { localStorage.removeItem(store('guest')); } catch {} location.reload(); }},
        {label: t.t('guest_wipe_session_dontwipe')}]}), 1200);
      v.guestUsed = true; write(v);
      (MM.notificationSources ||= []).push(c => [{id: 'guest', icon: 'assets/fw-ic_account_circle-guest.svg', title: t.t('guest_notification_title'), text: t.t('guest_notification_text'), ongoing: true,
        actions: [{label: t.t('guest_notification_remove_action'), action: c => U.exitGuestDialog(c)}]}]);
    }
  });
})();
/* Settings' UserDetailsSettings (user_details_settings.xml): Allow phone calls & SMS (for the guest Allow phone calls) and
   Remove user (user_confirm_remove_title / _message, Delete) or, for the guest, Remove guest. */
(() => {
  'use strict';
  const T = () => MM.text('users');
  MM.settingsScreens = MM.settingsScreens || {};
  MM.settingsScreens['user-detail'] = {
    render(c, cur) {
      const t = T(), id = cur.screen.split(':')[1], guest = id === 'guest', calls = (c.data.settings.userCalls || {})[id] ?? !guest;
      const row = (action, title, widget = '') => `<button type="button" class="mmst-pref" data-action="${action}"><span class="mmst-texts"><span class="mmst-title">${c.safe(title)}</span></span>${widget ? `<span class="mmst-widget">${widget}</span>` : ''}</button>`;
      return `<div class="mmst-list">${row('mmus-calls', t.t(guest ? 'Settings/user_enable_calling' : 'Settings/user_enable_calling_sms'), `<i class="mmw-switch${calls ? ' on' : ''}"><i class="mmw-thumb"></i></i>`)}
        ${guest ? (MM.users.hasGuest() ? row('mmus-remove', t.t('Settings/user_exit_guest_title')) : '') : row('mmus-remove', t.t('Settings/user_remove_user'))}</div>`;
    },
    action(c, name, el, cur) {
      const t = T(), id = cur.screen.split(':')[1], s = c.data.settings;
      if (name === 'mmus-calls') { s.userCalls = {...(s.userCalls || {}), [id]: !((s.userCalls || {})[id] ?? id !== 'guest')}; c.save(); c.render(); return true; }
      if (name !== 'mmus-remove') return false;
      if (id === 'guest') c.dialog({title: t.t('Settings/user_exit_guest_confirm_title'), message: t.t('Settings/user_exit_guest_confirm_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('Settings/user_exit_guest_dialog_remove'), action: c => { MM.users.removeGuest(c); c.ui.settings.stack.pop(); c.render(); }}]});
      else c.dialog({title: t.t('Settings/user_confirm_remove_title'), message: t.t('Settings/user_confirm_remove_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('Settings/user_delete_button'), action: c => { MM.users.removeUser(id); c.ui.settings.stack.pop(); c.render(); }}]});
      return true;
    }
  };
})();
